// Invoked by CRUD integration against an isolated PostgreSQL database and real MinIO.
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
const sharp = require('sharp');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
module.exports = async function storageChecks({ base, org, otherOrg, adminToken, staffToken, user, revisionId, petId, request, patch }) {
  const headers = { Authorization: `Bearer ${adminToken}`, 'X-Organization-Id': org };
  const photo = await sharp({create:{width:64,height:64,channels:3,background:'#835721'}}).png().toBuffer();
  const key = randomUUID();
  let stored;
  async function upload(data, status, overrides = {}, idempotency = key) {
    const body = new FormData(); body.append('file', new Blob([data], { type: 'image/png' }), 'Luna.png');
    const response = await fetch(`${base}/api/v1/storage/photos`, {method:'POST', headers:{...headers, 'Idempotency-Key':idempotency, ...overrides}, body});
    const result = await response.json();
    assert.equal(response.status, status, JSON.stringify(result));
    return result.data;
  }
  async function read(id, status, overrides = {}) {
    const response = await fetch(`${base}/api/v1/storage/${id}/content`, {headers:{...headers,...overrides}});
    assert.equal(response.status, status);
    return response;
  }
  try {
    await upload(photo, 401, {Authorization:''});
    await upload(photo, 403, {Authorization:`Bearer ${staffToken}`});
    await upload(Buffer.from('<script>fake image</script>'), 400);
    await upload(Buffer.alloc(10 * 1024 * 1024 + 1), 413);
    stored = await upload(photo, 201);
    assert.equal(stored.estado_analisis, 'disponible');
    assert.equal(stored.mime_detectado, 'image/webp');
    assert.equal((await upload(photo, 201)).id, stored.id);
    await upload(Buffer.concat([photo, Buffer.from('changed')]), 409);
    const response = await read(stored.id, 200);
    assert.equal(response.headers.get('content-type'), 'image/webp');
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'), stored.sha256);
    await read(stored.id, 401, {Authorization:''});
    await read(stored.id, 403, {Authorization:`Bearer ${staffToken}`});
    await read(stored.id, 404, {'X-Organization-Id':otherOrg});
    const anonymous = await fetch(`${process.env.S3_ENDPOINT}/${stored.contenedor}/${stored.ruta_relativa}`);
    assert.equal(anonymous.status, 403);
    const updated = await patch('mascota', {foto_archivo_id:stored.id});
    assert.equal(updated.data.foto_archivo_id, stored.id);
    const current = await request('GET', `/mascota/${petId}`);
    assert.equal(current.data.nombre, 'Luna');
    assert.equal(current.data.foto_archivo_id, stored.id);
    await request('PATCH', `/mascota/${petId}`, {foto_archivo_id:null}, 412, {'If-Match':'"1"'});
    if (process.env.TEST_BROWSER === 'true') await require('../../superkanes_frontend/test/clinical-browser.cjs')({base,adminToken,user,org,revisionId});
    await patch('mascota', {foto_archivo_id:null});
    console.log('OK: MinIO real: carga, hash, lectura privada, MIME falso, tamaño, permisos, aislamiento, idempotencia y foto de paciente.');
  } finally {
    if (stored) {
      const cleanup = new S3Client({ endpoint:process.env.S3_ENDPOINT, region:process.env.S3_REGION || 'us-east-1', forcePathStyle:true, credentials:{accessKeyId:process.env.MINIO_ROOT_USER, secretAccessKey:process.env.MINIO_ROOT_PASSWORD} });
      try { await cleanup.send(new DeleteObjectCommand({Bucket:stored.contenedor, Key:stored.ruta_relativa, VersionId:stored.version_objeto || undefined})); } finally { cleanup.destroy(); }
    }
  }
};
