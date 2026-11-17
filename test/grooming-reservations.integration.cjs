const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
module.exports = async function groomingReservations({request, owner, org, otherOrg, ids, staffToken, base, adminToken, user}) {
 const body={mascota_id:ids.mascota,tutor_contacto_id:ids.tutor,sede_id:ids.sede,tipo:'peluqueria',inicio:'2028-06-12T09:00:00-05:00',notas:'Baño'};
 const booking=(await request('POST','/cita',body,201)).data;
 assert.equal(booking.fin,null);
 await request('POST','/cita',{...body,tipo:'clinica'},400);
 await request('POST','/cita',{...body,tipo:'vacunacion'},400);
 await request('POST','/cita',{...body,fin:'2028-06-12T08:00:00-05:00'},400);
 const calendar=await request('GET','/clinica/calendario?from=2028-06-12&to=2028-06-12&timeZone=America%2FBogota');
 assert.ok(calendar.data.some(r=>r.id===booking.id && r.end===null));
 const path=`/clinica/citas/${booking.id}/ingreso-peluqueria`, key=randomUUID();
 const headers={'If-Match':String(booking.version),'Idempotency-Key':key};
 await request('POST',path,{},403,{...headers,Authorization:`Bearer ${staffToken}`});
 await request('POST',path,{},404,{...headers,'X-Organization-Id':otherOrg});
 await request('POST',path,{llegada_en:'2020-01-01T00:00:00Z'},400,headers);
 const before=Date.now();
 const result=(await request('POST',path,{},201,headers)).data;
 const arrival=Date.parse(result.service.llegada_en);
 assert.ok(arrival>=before-1000 && arrival<=Date.now()+1000);
 assert.equal(result.appointment.llegada_en,result.service.llegada_en);
 assert.equal(result.service.estado,'recibido');
 assert.equal(result.service.requiere_consentimiento,true);
 assert.equal(result.service.responsable_id,null);assert.equal(result.service.telefono_contacto_servicio,null);
 assert.equal(result.service.inicio_en,null);assert.equal(result.service.finalizado_en,null);assert.equal(result.service.entregado_en,null);
 const replay=(await request('POST',path,{},201,headers)).data;
 assert.equal(replay.service.id,result.service.id);assert.equal(replay.service.llegada_en,result.service.llegada_en);
 await request('POST',path,{},412,{'If-Match':String(booking.version)});
 await request('POST',path,{},409,{'If-Match':String(result.appointment.version)});
 const [count]=await owner.query('SELECT count(*)::int AS n FROM vet.servicio_peluqueria WHERE organizacion_id=$1 AND cita_id=$2',[org,booking.id]);assert.equal(count.n,1);
 const consent=await owner.query('SELECT id FROM vet.consentimiento WHERE organizacion_id=$1 AND servicio_id=$2',[org,result.service.id]);assert.equal(consent.length,0);
 await request('PATCH',`/servicio_peluqueria/${result.service.id}`,{estado:'en_servicio',inicio_en:new Date().toISOString()},400,{'If-Match':String(result.service.version)});
 await request('PATCH',`/servicio_peluqueria/${result.service.id}`,{estado:'en_servicio',inicio_en:new Date().toISOString(),responsable_id:ids.rootMembership,telefono_contacto_servicio:'123456789'},409,{'If-Match':String(result.service.version)});
 const service= (await request('GET',`/servicio_peluqueria/${result.service.id}`)).data;assert.equal(service.estado,'recibido');assert.equal(service.inicio_en,null);
 // Separate create/update permissions and site scopes are checked before admission.
 const scopedRole=randomUUID(), scopedAssignment=randomUUID();
 const otherSite=(await request('POST','/sede',{nombre:'Sede fuera de alcance de ingreso',codigo:'ING-02'},201)).data;
 await owner.query("INSERT INTO vet.rol(id,organizacion_id,nombre) VALUES($1,$2,'Ingreso de prueba')",[scopedRole,org]);
 await owner.query("INSERT INTO vet.rol_permiso(organizacion_id,rol_id,permiso_id) SELECT $1,$2,id FROM vet.permiso WHERE codigo='servicio_peluqueria.create'",[org,scopedRole]);
 await owner.query("INSERT INTO vet.rol_permiso(organizacion_id,rol_id,permiso_id) SELECT $1,$2,id FROM vet.permiso WHERE codigo='cita.update'",[org,ids.rol]);
 await owner.query('INSERT INTO vet.asignacion_rol(id,organizacion_id,membresia_id,rol_id,sede_id) VALUES($1,$2,$3,$4,$5)',[scopedAssignment,org,ids.membresia,scopedRole,otherSite.id]);
 try {
  const scopedBooking=(await request('POST','/cita',body,201)).data;
  const scopedPath=`/clinica/citas/${scopedBooking.id}/ingreso-peluqueria`;
  await request('POST',scopedPath,{},403,{'If-Match':String(scopedBooking.version),Authorization:`Bearer ${staffToken}`});
  const [notCreated]=await owner.query('SELECT count(*)::int AS n FROM vet.servicio_peluqueria WHERE cita_id=$1',[scopedBooking.id]);assert.equal(notCreated.n,0);
  await owner.query('UPDATE vet.asignacion_rol SET sede_id=$1 WHERE id=$2',[ids.sede,scopedAssignment]);
  const received=(await request('POST',scopedPath,{},201,{'If-Match':String(scopedBooking.version),Authorization:`Bearer ${staffToken}`})).data;
  assert.equal(received.service.sede_id,ids.sede);assert.equal(received.service.creado_por,ids.usuario);
 } finally {
  await owner.query('DELETE FROM vet.asignacion_rol WHERE id=$1',[scopedAssignment]);
  await owner.query("DELETE FROM vet.rol_permiso WHERE rol_id=$1 OR (rol_id=$2 AND permiso_id IN (SELECT id FROM vet.permiso WHERE codigo='cita.update'))",[scopedRole,ids.rol]);
  await owner.query('DELETE FROM vet.rol WHERE id=$1',[scopedRole]);
 }
 const runner=owner.createQueryRunner();await runner.connect();await runner.startTransaction();
 try {
  const {GroomingReservations1794900000000}=require('../dist/database/migrations/1794900000000-grooming-reservations');
  await assert.rejects(new GroomingReservations1794900000000().down(runner));
 } finally {await runner.rollbackTransaction();await runner.release();}
 if(process.env.TEST_RELATION_BROWSER==='true') await require('../../superkanes_frontend/test/grooming-browser.cjs')({base,adminToken,user,ids});
 console.log('OK: reserva de estética sin fin, calendario, ingreso con hora servidor, consentimiento pendiente, reintentos, permisos, aislamiento y rollback sin pérdida.');
};
