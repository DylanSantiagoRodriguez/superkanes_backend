const assert=require('node:assert/strict');
const {randomUUID,createHash}=require('node:crypto');
const {PDFDocument}=require('pdf-lib');
const {S3Client,DeleteObjectCommand}=require('@aws-sdk/client-s3');
module.exports=async function documents({base,request,owner,org,otherOrg,ids,adminToken,staffToken}) {
  const headers={Authorization:`Bearer ${adminToken}`,'X-Organization-Id':org};
  const attention=(await request('POST','/atencion_clinica/con-historia',{mascota_id:ids.mascota,sede_id:ids.sede,fecha_atencion:new Date().toISOString(),profesional_id:ids.profesional,motivo_consulta:'Documentos clínicos de prueba'},201)).data;
  let revision=(await owner.query('SELECT * FROM vet.revision_clinica WHERE atencion_id=$1',[attention.id]))[0];
  const pdf=await PDFDocument.create();pdf.addPage();const bytes=Buffer.from(await pdf.save());
  const key=randomUUID(),initialVersion=revision.version;
  async function upload(buffer,status=201,extra={},version=initialVersion,idempotency=key){
    const form=new FormData();form.append('file',new Blob([buffer],{type:'application/pdf'}),'Informe.pdf');
    const response=await fetch(`${base}/api/v1/storage/clinical/revisiones/${revision.id}/adjuntos`,{method:'POST',headers:{...headers,'If-Match':`"${version}"`,'Idempotency-Key':idempotency,...extra},body:form});
    const body=await response.json();assert.equal(response.status,status,JSON.stringify(body));return body.data;
  }
  async function download(id,status=200,extra={}){
    const response=await fetch(`${base}/api/v1/storage/clinical/${id}/content`,{headers:{...headers,...extra}});assert.equal(response.status,status);return response;
  }
  try {
    await upload(bytes,401,{Authorization:''});
    await upload(bytes,403,{Authorization:`Bearer ${staffToken}`});
    await upload(Buffer.from('%PDF-1.7 invalid'),400);
    const result=await upload(bytes);revision=result.revision;
    assert.equal(result.archivo.sha256,createHash('sha256').update(bytes).digest('hex'));
    assert.equal((await upload(bytes)).archivo.id,result.archivo.id);
    const response=await download(result.archivo.id);assert.match(response.headers.get('content-disposition'),/^attachment/);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes);
    await download(result.archivo.id,404,{'X-Organization-Id':otherOrg});
    await download(result.archivo.id,403,{Authorization:`Bearer ${staffToken}`});
    const closed=(await request('POST',`/clinica/revisiones/${revision.id}/guardar`,{revision:{evaluacion:'Control documental',plan:'Indicaciones para el tutor'},close:true},201,{'If-Match':`"${revision.version}"`})).data.revision;
    await upload(bytes,409,{},closed.version,randomUUID());
    for(const type of ['historia','receta','indicaciones']){
      const reportKey=randomUUID(),url=`${base}/api/v1/storage/clinical/revisiones/${revision.id}/reportes/${type}`;
      const emit=async()=>{const response=await fetch(url,{method:'POST',headers:{...headers,'Idempotency-Key':reportKey}});const result=await response.json();assert.equal(response.status,201,JSON.stringify(result));return result.data;};
      const report=await emit();assert.equal((await emit()).report.id,report.report.id);
      const downloadResponse=await download(report.archivo.id),rendered=Buffer.from(await downloadResponse.arrayBuffer());
      assert.equal(report.archivo.sha256,createHash('sha256').update(rendered).digest('hex'));
      assert.ok((await PDFDocument.load(rendered)).getPageCount()>0);
      assert.equal(report.report.parametros.revision_id,revision.id);
      assert.equal(report.report.datos_identificacion_snapshot.patient.id,ids.mascota);
    }
    console.log('OK: adjuntos privados, PDF real, bytes originales, hash, permisos, cierre y reportes versionados idempotentes.');
  }finally{
    const rows=await owner.query("SELECT contenedor,ruta_relativa,version_objeto FROM vet.archivo WHERE organizacion_id=$1 AND ruta_relativa LIKE $2",[org,`${org}/clinical/%`]);
    const client=new S3Client({endpoint:process.env.S3_ENDPOINT,region:process.env.S3_REGION||'us-east-1',forcePathStyle:true,credentials:{accessKeyId:process.env.MINIO_ROOT_USER,secretAccessKey:process.env.MINIO_ROOT_PASSWORD}});
    try{for(const row of rows)await client.send(new DeleteObjectCommand({Bucket:row.contenedor,Key:row.ruta_relativa,VersionId:row.version_objeto||undefined}));}finally{client.destroy();}
  }
};
