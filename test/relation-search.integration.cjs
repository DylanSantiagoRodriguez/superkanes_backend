const assert = require('node:assert/strict');
module.exports = async function relationSearch({request,owner,org,otherOrg,ids,staffToken,base,adminToken,user}) {
  const fixture=[];
  for(let i=0;i<28;i++) {
    const pet=await request('POST','/mascota',{codigo:`SEARCH-${i}`,nombre:'Busqueda lote',especie_id:ids.especie,tutor_principal_id:ids.tutor},201);
    fixture.push(pet.data);
  }
  const first=await request('GET','/mascota?search=Busqueda%20lote');
  assert.equal(first.data.length,25);assert.ok(first.page.next);
  const second=await request('GET',`/mascota?search=Busqueda%20lote&after=${first.page.next}`);
  assert.equal(second.data.length,3);assert.equal(new Set([...first.data,...second.data].map(r=>r.id)).size,28);
  const outside=second.data[0];
  const found=await request('GET',`/mascota?search=${encodeURIComponent(outside.codigo.toLowerCase())}`);
  assert.equal(found.data[0].id,outside.id);
  const filtered=await request('GET',`/mascota?search=Busqueda&filter=${encodeURIComponent(JSON.stringify({id:outside.id}))}`);
  assert.deepEqual(filtered.data.map(r=>r.id),[outside.id]);
  const literal=await request('POST','/mascota',{codigo:'LITERAL%_X',nombre:'Texto literal',microchip:'CHIP-987654321',especie_id:ids.especie,tutor_principal_id:ids.tutor},201);
  for(const query of ['%_X','987654321']){
    const page=await request('GET',`/mascota?search=${encodeURIComponent(query)}`);assert.deepEqual(page.data.map(r=>r.id),[literal.data.id]);
  }
  assert.equal((await request('GET',`/mascota?search=${encodeURIComponent("' OR 1=1 --")}`)).data.length,0);
  await owner.query('UPDATE vet.asignacion_rol SET sede_id=$1 WHERE id=$2',[ids.sede,ids.asignacion_rol]);
  try { await request('GET','/mascota?search=x',undefined,403,{Authorization:`Bearer ${staffToken}`}); }
  finally { await owner.query('UPDATE vet.asignacion_rol SET sede_id=NULL WHERE id=$1',[ids.asignacion_rol]); }
  await request('GET','/archivo?search=x',undefined,400);
  await request('GET',`/tutor?search=${'x'.repeat(121)}`,undefined,400);
  await request('GET','/tutor?search[x]=1',undefined,400);
  const tutors=await request('GET','/tutor?search=ana%20prueba');assert.ok(tutors.data.some(r=>r.id===ids.tutor));
  const email=await request('GET','/tutor?search=ana%40example.test');assert.ok(email.data.some(r=>r.id===ids.tutor));
  await owner.query("INSERT INTO vet.tutor(organizacion_id,nombres,apellidos) VALUES($1,'Busqueda','Privada')",[otherOrg]);
  assert.equal((await request('GET','/tutor?search=Busqueda%20Privada')).data.length,0);
  assert.equal((await request('GET','/mascota?search=Busqueda',undefined,200,{'X-Organization-Id':otherOrg})).data.length,0);
  if(process.env.TEST_BROWSER==='true') {
    const result=await require('../../superkanes_frontend/test/quick-entry-browser.cjs')({base,adminToken,user,ids,outside});
    const link=await owner.query('SELECT tutor_id FROM vet.mascota_tutor WHERE mascota_id=$1 AND es_principal AND vigente_hasta IS NULL',[result.petId]);
    assert.deepEqual(link.map(r=>r.tutor_id),[result.tutorId]);
    const [appointment]=await owner.query('SELECT mascota_id,tutor_contacto_id,notas FROM vet.cita WHERE id=$1',[result.appointmentId]);
    assert.equal(appointment.mascota_id,result.petId);assert.equal(appointment.tutor_contacto_id,result.tutorId);assert.equal(appointment.notas,'Datos de la cita conservados');
    const [count]=await owner.query("SELECT count(*)::int AS n FROM vet.tutor WHERE organizacion_id=$1 AND nombres='Tutor contextual'",[org]);assert.equal(count.n,1);
  }
  console.log('OK: búsqueda paginada global, texto literal, permisos, aislamiento y alta contextual vinculada.');
};
