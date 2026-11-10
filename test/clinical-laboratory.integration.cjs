const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
module.exports=async function laboratory({request,owner,org,otherOrg,ids,staffToken}){
  const root='/clinica/laboratorio',key=randomUUID(),body={atencion_id:ids.atencion_clinica,laboratorio_id:ids.laboratorio,pruebas:'Examen sintético',indicacion:'Indicación profesional'};
  assert.deepEqual((await request('GET',root+'/permisos')).data,{read:true,create:true,update:true});
  await request('POST',root+'/ordenes',body,403,{Authorization:`Bearer ${staffToken}`});
  let order=(await request('POST',root+'/ordenes',body,201,{'Idempotency-Key':key})).data;
  assert.equal((await request('POST',root+'/ordenes',body,201,{'Idempotency-Key':key})).data.id,order.id);
  const path=`${root}/ordenes/${order.id}/avanzar`;
  await request('POST',path,{accion:'revisar',interpretacion:'Salto inválido'},409,{'If-Match':`"${order.version}"`});
  await request('POST',path,{accion:'muestra',muestra:'Muestra A'},404,{'If-Match':`"${order.version}"`,'X-Organization-Id':otherOrg});
  for(const action of [{accion:'muestra',muestra:'Muestra A'},{accion:'procesar'},{accion:'resultado',resultado:'Resultado informado por laboratorio'},{accion:'revisar',interpretacion:'Interpretación del veterinario'},{accion:'comunicar',comunicacion:'Tutor informado presencialmente; control indicado'}]){
    const version=order.version;order=(await request('POST',path,action,201,{'If-Match':`"${version}"`})).data;
    await request('POST',path,action,412,{'If-Match':`"${version}"`});
  }
  await request('POST',path,{accion:'resultado',resultado:'Corrección sin motivo'},400,{'If-Match':`"${order.version}"`});
  order=(await request('POST',path,{accion:'resultado',resultado:'Resultado corregido',motivo_correccion:'Aclaración del laboratorio'},201,{'If-Match':`"${order.version}"`})).data;
  assert.equal(order.estado,'resultado_disponible');
  const records=(await request('GET',`${root}/atenciones/${ids.atencion_clinica}/ordenes`)).data;
  const loaded=records.find(row=>row.id===order.id);assert.equal(loaded.resultados.length,2);assert.equal(loaded.resultados[1].resultado,'Resultado informado por laboratorio');
  assert.ok(loaded.eventos.some(event=>event.datos.anterior.interpretacion==='Interpretación del veterinario'));
  await assert.rejects(owner.query('UPDATE vet.resultado_laboratorio SET resultado=$1 WHERE id=$2',['Sobrescribir',loaded.resultados[1].id]));
  await request('GET',`${root}/atenciones/${ids.atencion_clinica}/ordenes`,undefined,403,{Authorization:`Bearer ${staffToken}`});
  const timeline=(await request('GET',`/clinica/pacientes/${ids.mascota}/registros/historia?type=laboratorio`)).data;assert.ok(timeline.some(row=>row.id===order.id));
  console.log('OK: circuito de laboratorio, resultados inmutables, corrección versionada, interpretación conservada e historial.');
};
