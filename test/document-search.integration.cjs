const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
module.exports = async function search({base,owner,org,otherOrg,ids,adminToken,staffToken,first,revision,raw}) {
  const headers = {Authorization:`Bearer ${adminToken}`,'X-Organization-Id':org};
  const endpoint = `${base}/api/v1/storage/clinical/pacientes/${ids.mascota}/documentos`;
  let checks=0;
  async function list(query={},extra={},status=200) {
    const response=await fetch(`${endpoint}?${new URLSearchParams(query)}`,{headers:{...headers,...extra}});
    const value=await response.json();assert.equal(response.status,status,JSON.stringify(value));checks++;return value;
  }
  const original=await list({revision_id:revision.id});
  assert.deepEqual((await list({codigo:'   ',revision_id:revision.id})).data,original.data);
  for(const codigo of [first.id, first.id.toUpperCase(), `  ${first.id}  `, first.id.slice(5,16).toUpperCase()]) {
    assert.deepEqual((await list({codigo,revision_id:revision.id})).data.map(r=>r.id),[first.id]);
  }
  assert.deepEqual((await list({codigo:first.id,revision_id:randomUUID()})).data,[]);
  assert.deepEqual((await list({codigo:randomUUID()})).data,[]);
  for(const codigo of ['ab','a'.repeat(37),'%','___',"' OR 1=1 --",'xyz'])await list({codigo},{},400);
  await list({codigo:first.id},{Authorization:''},401);
  await list({codigo:first.id},{Authorization:`Bearer ${staffToken}`},403);
  await list({codigo:first.id},{'X-Organization-Id':otherOrg},404);
  const repeated=await fetch(`${endpoint}?codigo=abc&codigo=def`,{headers});assert.equal(repeated.status,400);checks++;
  // Grant a separate role only during this test: the filter must keep site authorization.
  const [role]=await owner.query("INSERT INTO vet.rol(organizacion_id,nombre) VALUES($1,'Prueba búsqueda documental') RETURNING id",[org]);
  await owner.query('INSERT INTO vet.rol_permiso(organizacion_id,rol_id,permiso_id) SELECT $1,$2,id FROM vet.permiso WHERE codigo=ANY($3::text[])',[org,role.id,['mascota.read','archivo.read']]);
  const [globalAssignment]=await owner.query('INSERT INTO vet.asignacion_rol(organizacion_id,membresia_id,rol_id) VALUES($1,$2,$3) RETURNING id',[org,ids.membresia,role.id]);
  const [clinicalRole]=await owner.query("INSERT INTO vet.rol(organizacion_id,nombre) VALUES($1,'Prueba búsqueda por sede') RETURNING id",[org]);
  await owner.query("INSERT INTO vet.rol_permiso(organizacion_id,rol_id,permiso_id) SELECT $1,$2,id FROM vet.permiso WHERE codigo='revision_clinica.read'",[org,clinicalRole.id]);
  const [assignment]=await owner.query('INSERT INTO vet.asignacion_rol(organizacion_id,membresia_id,rol_id,sede_id) VALUES($1,$2,$3,$4) RETURNING id',[org,ids.membresia,clinicalRole.id,ids.sede]);
  try {
    assert.deepEqual((await list({codigo:first.id},{Authorization:`Bearer ${staffToken}`})).data.map(r=>r.id),[first.id]);
    const [site]=await owner.query("INSERT INTO vet.sede(organizacion_id,nombre,codigo) VALUES($1,'Sede búsqueda ajena','SDD') RETURNING id",[org]);
    await owner.query('UPDATE vet.asignacion_rol SET sede_id=$1 WHERE id=$2',[site.id,assignment.id]);
    assert.deepEqual((await list({codigo:first.id},{Authorization:`Bearer ${staffToken}`})).data,[]);
  } finally { await owner.query('DELETE FROM vet.asignacion_rol WHERE id=ANY($1::uuid[])',[[assignment.id,globalAssignment.id]]); }
  // Metadata-only fixtures for deterministic pagination, separate from real MinIO downloads.
  const fixture=[];
  for(let i=0;i<28;i++) {
    const id=`abcdef00-0000-4000-8000-${String(i).padStart(12,'0')}`;
    const [file]=await owner.query(`INSERT INTO vet.archivo(organizacion_id,proveedor,contenedor,ruta_relativa,nombre_original,categoria)
      VALUES($1,'local','test',$2,'fixture.json','documento_clinico') RETURNING id`,[org,`test/${id}`]);
    await owner.query(`INSERT INTO vet.documento_clinico_version(id,organizacion_id,mascota_id,atencion_id,revision_id,archivo_id,version_revision,creado_por)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,[id,org,ids.mascota,first.atencion_id,first.revision_id,file.id,1000+i,first.creado_por]);
    fixture.push(id);
  }
  const page1=await list({codigo:'ABCDEF',revision_id:first.revision_id});
  assert.deepEqual(page1.data.map(r=>r.id),fixture.slice(0,25));assert.equal(page1.page.limit,25);
  const page2=await list({codigo:'ABCDEF',revision_id:first.revision_id,after:page1.page.next});
  assert.deepEqual(page2.data.map(r=>r.id),fixture.slice(25));assert.equal(page2.page.next,null);
  assert.deepEqual((await list({codigo:fixture[27]})).data.map(r=>r.id),[fixture[27]]);
  assert.deepEqual((await list({codigo:'ABCDEF',revision_id:randomUUID()})).data,[]);
  const content=await fetch(`${base}/api/v1/storage/clinical/${first.archivo_id}/content`,{headers});
  assert.equal(content.status,200);assert.deepEqual(Buffer.from(await content.arrayBuffer()),raw);
  assert.equal((await list({codigo:first.id})).data[0].version_revision,first.version_revision);
  if(process.env.TEST_BROWSER==='true') {
    const [pet]=await owner.query('SELECT nombre FROM vet.mascota WHERE id=$1',[ids.mascota]);
    await require('../../superkanes_frontend/test/document-search-browser.cjs')({base,adminToken,user:first.creado_por,petName:pet.nombre,first,fixture});
  }
  console.log(`OK: ${checks} consultas de búsqueda documental: exacta/parcial, validación, permisos, sedes, paginación y descarga inalterada.`);
};
