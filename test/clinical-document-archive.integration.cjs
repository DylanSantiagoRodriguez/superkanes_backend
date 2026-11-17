const assert=require('node:assert/strict');
const {randomUUID,createHash}=require('node:crypto');
module.exports=async function archive({base,request,owner,org,otherOrg,ids,adminToken,staffToken,app}){
  const headers={Authorization:`Bearer ${adminToken}`,'X-Organization-Id':org};
  const list=async(patient,revision,extra={},expected=200)=>{
    const r=await fetch(`${base}/api/v1/storage/clinical/pacientes/${patient}/documentos?revision_id=${revision}`,{headers:{...headers,...extra}});
    assert.equal(r.status,expected);return r.json();
  };
  const get=async(id,extra={},expected=200)=>{
    const r=await fetch(`${base}/api/v1/storage/clinical/${id}/content`,{headers:{...headers,...extra}});
    assert.equal(r.status,expected);return r;
  };
  const body={mascota_id:ids.mascota,sede_id:ids.sede,fecha_atencion:new Date().toISOString(),profesional_id:ids.profesional,motivo_consulta:'Documento archivado de prueba',documento:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Contenido con formato pegado',marks:[{type:'textStyle',attrs:{color:'rgb(36, 91, 166)',backgroundColor:'',fontSize:'16px'}}]}]}]}};
  const key=randomUUID();
  const attention=(await request('POST','/atencion_clinica/con-historia',body,201,{'Idempotency-Key':key})).data;
  assert.equal((await request('POST','/atencion_clinica/con-historia',body,201,{'Idempotency-Key':key})).data.id,attention.id);
  let [revision]=await owner.query('SELECT * FROM vet.revision_clinica WHERE atencion_id=$1',[attention.id]);
  let versions=(await list(ids.mascota,revision.id)).data;assert.equal(versions.length,1);
  const first=versions[0];assert.equal(first.mascota_id,ids.mascota);assert.equal(first.atencion_id,attention.id);
  const [file]=await owner.query('SELECT * FROM vet.archivo WHERE id=$1',[first.archivo_id]);
  assert.match(file.ruta_relativa,new RegExp(`^${org}/clinical/pacientes/${ids.mascota}/revisiones/${revision.id}/`));assert.equal(file.proveedor,'minio');assert.ok(file.version_objeto);
  const raw=Buffer.from(await (await get(file.id)).arrayBuffer());assert.equal(createHash('sha256').update(raw).digest('hex'),file.sha256);
  assert.deepEqual(JSON.parse(raw),revision.documento);assert.equal(revision.documento.content[0].content[0].marks[0].attrs.color,'#245ba6');
  const second={type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Documento actualizado'}]}]};
  revision=(await request('PATCH',`/revision_clinica/${revision.id}`,{documento:second},200,{'If-Match':`"${revision.version}"`})).data;
  versions=(await list(ids.mascota,revision.id)).data;assert.equal(versions.length,2);
  assert.deepEqual(Buffer.from(await (await get(file.id)).arrayBuffer()),raw);
  revision=(await request('PATCH',`/revision_clinica/${revision.id}`,{documento:second},200,{'If-Match':`"${revision.version}"`})).data;
  assert.equal((await list(ids.mascota,revision.id)).data.length,2);
  await list(ids.mascota,revision.id,{'X-Organization-Id':otherOrg},404);
  await get(file.id,{'X-Organization-Id':otherOrg},404);
  await list(ids.mascota,revision.id,{Authorization:`Bearer ${staffToken}`},403);
  await get(file.id,{Authorization:`Bearer ${staffToken}`},403);
  // Grant only the minimum read permissions and exercise site inheritance.
  const [role]=await owner.query("INSERT INTO vet.rol(organizacion_id,nombre) VALUES($1,'Lectura documental de prueba') RETURNING id",[org]);
  await owner.query('INSERT INTO vet.rol_permiso(organizacion_id,rol_id,permiso_id) SELECT $1,$2,id FROM vet.permiso WHERE codigo=ANY($3::text[])',[org,role.id,['mascota.read','archivo.read']]);
  const [assignment]=await owner.query('INSERT INTO vet.asignacion_rol(organizacion_id,membresia_id,rol_id) VALUES($1,$2,$3) RETURNING id',[org,ids.membresia,role.id]);
  const [clinicalRole]=await owner.query("INSERT INTO vet.rol(organizacion_id,nombre) VALUES($1,'Lectura clínica por sede de prueba') RETURNING id",[org]);
  await owner.query("INSERT INTO vet.rol_permiso(organizacion_id,rol_id,permiso_id) SELECT $1,$2,id FROM vet.permiso WHERE codigo='revision_clinica.read'",[org,clinicalRole.id]);
  const [clinicalAssignment]=await owner.query('INSERT INTO vet.asignacion_rol(organizacion_id,membresia_id,rol_id,sede_id) VALUES($1,$2,$3,$4) RETURNING id',[org,ids.membresia,clinicalRole.id,ids.sede]);
  await get(file.id,{Authorization:`Bearer ${staffToken}`});
  assert.equal((await list(ids.mascota,revision.id,{Authorization:`Bearer ${staffToken}`})).data.length,2);
  const [site]=await owner.query("INSERT INTO vet.sede(organizacion_id,nombre,codigo) VALUES($1,'Sede documental ajena','DOC') RETURNING id",[org]);
  await owner.query('UPDATE vet.asignacion_rol SET sede_id=$1 WHERE id=$2',[site.id,clinicalAssignment.id]);
  await get(file.id,{Authorization:`Bearer ${staffToken}`},404);
  assert.equal((await list(ids.mascota,revision.id,{Authorization:`Bearer ${staffToken}`})).data.length,0);
  await owner.query('DELETE FROM vet.asignacion_rol WHERE id=ANY($1::uuid[])',[[assignment.id,clinicalAssignment.id]]);
  await assert.rejects(()=>owner.query('UPDATE vet.documento_clinico_version SET version_revision=999 WHERE id=$1',[first.id]));
  // Actual transaction rollback when S3 cannot accept a new document.
  const storage=app.get(require('../dist/storage/storage.service').StorageService),original=storage.storeClinical;
  storage.storeClinical=async()=>{throw new (require('@nestjs/common').ServiceUnavailableException)('Fallo de almacenamiento simulado');};
  try{
    await request('PATCH',`/revision_clinica/${revision.id}`,{documento:body.documento},503,{'If-Match':`"${revision.version}"`});
    const current=(await request('GET',`/revision_clinica/${revision.id}`)).data;assert.equal(current.version,revision.version);assert.deepEqual(current.documento,second);
    const before=(await owner.query('SELECT count(*)::int n FROM vet.atencion_clinica WHERE organizacion_id=$1',[org]))[0].n;
    await request('POST','/atencion_clinica/con-historia',body,503);
    assert.equal((await owner.query('SELECT count(*)::int n FROM vet.atencion_clinica WHERE organizacion_id=$1',[org]))[0].n,before);
  }finally{storage.storeClinical=original;}
  const closed=(await request('POST',`/clinica/revisiones/${revision.id}/guardar`,{revision:{evaluacion:'Evaluación de prueba',plan:'Plan de prueba'},close:true},201,{'If-Match':`"${revision.version}"`})).data.revision;
  await request('PATCH',`/revision_clinica/${revision.id}`,{documento:body.documento},409,{'If-Match':`"${closed.version}"`});
  const correction=(await request('POST',`/clinica/revisiones/${revision.id}/corregir`,{motivo_cambio:'Aclaración documental de prueba'},201,{'If-Match':`"${closed.version}"`})).data.revision;
  assert.equal((await list(ids.mascota,correction.id)).data.length,1);
  assert.equal((await list(ids.mascota,revision.id)).data.length,2);
  await require('./document-search.integration.cjs')({base,owner,org,otherOrg,ids,adminToken,staffToken,first,revision,raw});
  console.log('OK: documento del editor en MinIO, vínculo de paciente, hash, versiones, normalización, permisos, rollback y corrección.');
};
