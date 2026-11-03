const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
module.exports = async function clinicalAttention({request,owner,org,ids,staffToken,now}) {
  assert.equal((await request('GET','/atencion_clinica/autor')).data.id, ids.profesional);
  await request('GET','/atencion_clinica/autor',undefined,401,{Authorization:''});
  await request('GET','/atencion_clinica/autor',undefined,403,{Authorization:`Bearer ${staffToken}`});
  const body = {mascota_id:ids.mascota,sede_id:ids.sede,fecha_atencion:now,profesional_id:ids.profesional,motivo_consulta:'Consulta con historia integrada',documento:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Historia inicial del paciente'}]}]}};
  const key = randomUUID();
  const created = await request('POST','/atencion_clinica/con-historia',body,201,{'Idempotency-Key':key});
  const again = await request('POST','/atencion_clinica/con-historia',body,201,{'Idempotency-Key':key});
  assert.equal(created.data.id, again.data.id);
  const rows = await owner.query('SELECT numero,estado,documento FROM vet.revision_clinica WHERE atencion_id=$1',[created.data.id]);
  assert.equal(rows.length,1);assert.equal(rows[0].numero,1);assert.equal(rows[0].estado,'borrador');assert.deepEqual(rows[0].documento,body.documento);
  await request('POST','/atencion_clinica/con-historia',{...body,motivo_consulta:'Otro texto'},409,{'Idempotency-Key':key});
  const count = async()=> (await owner.query('SELECT count(*)::int AS n FROM vet.atencion_clinica WHERE organizacion_id=$1',[org]))[0].n;
  const before = await count();
  await request('POST','/atencion_clinica/con-historia',{...body,documento:{type:'image'}},400);
  await owner.query("INSERT INTO vet.rol_permiso(organizacion_id,rol_id,permiso_id) SELECT $1,$2,id FROM vet.permiso WHERE codigo=ANY($3::text[])",[org,ids.rol,['atencion_clinica.create','atencion_clinica.read','mascota.read','sede.read','profesional.read']]);
  assert.equal((await request('GET','/atencion_clinica/autor',undefined,200,{Authorization:`Bearer ${staffToken}`})).data,null);
  const [professional] = await owner.query("INSERT INTO vet.profesional(organizacion_id,membresia_id,nombre_profesional) VALUES($1,$2,'Otro profesional') RETURNING id",[org,ids.membresia]);
  await request('POST','/atencion_clinica/con-historia',{...body,profesional_id:professional.id},403);
  await request('POST','/atencion_clinica/con-historia',{...body,profesional_id:professional.id},403,{Authorization:`Bearer ${staffToken}`});
  // Parent creation is allowed, but the revision is scoped to a different site.
  // Failure after inserting both rows must roll the whole transaction back.
  const [otherSite] = await owner.query("INSERT INTO vet.sede(organizacion_id,nombre,codigo) VALUES($1,'Sede de rollback','RB') RETURNING id",[org]);
  const [role] = await owner.query("INSERT INTO vet.rol(organizacion_id,nombre) VALUES($1,'Revisor de otra sede') RETURNING id",[org]);
  await owner.query("INSERT INTO vet.rol_permiso(organizacion_id,rol_id,permiso_id) SELECT $1,$2,id FROM vet.permiso WHERE codigo='revision_clinica.create'",[org,role.id]);
  await owner.query('INSERT INTO vet.asignacion_rol(organizacion_id,membresia_id,rol_id,sede_id) VALUES($1,$2,$3,$4)',[org,ids.membresia,role.id,otherSite.id]);
  await request('POST','/atencion_clinica/con-historia',{...body,profesional_id:professional.id},404,{Authorization:`Bearer ${staffToken}`});
  assert.equal(await count(),before);
  console.log('OK: atención e historia atómicas, reintentos, rollback, permisos y profesional autenticado.');
};
