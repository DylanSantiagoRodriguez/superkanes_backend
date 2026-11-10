const assert = require('node:assert/strict');
module.exports = async function patientChart({request,owner,org,otherOrg,ids,staffToken}) {
  const path = `/clinica/pacientes/${ids.mascota}`;
  const summary = (await request('GET',path)).data;
  assert.equal(summary.patient.id,ids.mascota);
  assert.equal(summary.species.nombre,'Canino');
  assert.equal(summary.guardian.nombres,'Ana');
  assert.equal(summary.overview.alertas.data[0].tipo,'alergia');
  await request('GET',path,undefined,401,{Authorization:''});
  await request('GET',path+'/registros/mediciones',undefined,403,{Authorization:`Bearer ${staffToken}`});
  await request('GET',path,undefined,404,{'X-Organization-Id':otherOrg});
  await request('GET',path+'/registros/historia?limit=101',undefined,400);
  await request('GET',path+'/registros/historia?after=bad',undefined,400);
  await request('GET',path+'/registros/historia?from=2027-01-01&to=2026-01-01',undefined,400);
  await request('GET',path+'/registros/no-existe',undefined,404);
  const all = [], cursors = new Set(); let cursor;
  do {
    const page = await request('GET',path+'/registros/historia?limit=1'+(cursor?'&after='+encodeURIComponent(cursor):''));
    all.push(...page.data); cursor=page.page.next;
    if(cursor) { assert.ok(!cursors.has(cursor));cursors.add(cursor); }
  } while(cursor);
  assert.ok(all.some(row=>row.tipo_evento==='clinica'));
  assert.ok(all.some(row=>row.tipo_evento==='vacunacion'));
  assert.equal(new Set(all.map(row=>row.tipo_evento+row.id)).size,all.length);
  const vaccines=await request('GET',path+'/registros/historia?type=vacunacion');
  assert.ok(vaccines.data.every(row=>row.tipo_evento==='vacunacion'));
  const diagnoses=await request('GET',path+'/registros/diagnosticos');
  assert.ok(diagnoses.data.some(row=>row.revision_id===ids.revision_clinica));
  // Grant only pet access: the dossier must not leak clinical information.

  const limited=(await request('GET',path,undefined,200,{Authorization:`Bearer ${staffToken}`})).data;
  assert.equal(limited.overview.alertas,null);assert.equal(limited.overview.revisiones,null);assert.equal(limited.guardian,null);
  const partial=await request('GET',path+'/registros/historia',undefined,200,{Authorization:`Bearer ${staffToken}`});
  assert.deepEqual(partial.unavailable,['vacunacion','peluqueria','cita','laboratorio']);
  assert.ok(partial.data.every(row=>row.tipo_evento==='clinica'));

  console.log('OK: ficha clínica, paginación, filtros, ausencia de permisos y aislamiento entre organizaciones.');
};
