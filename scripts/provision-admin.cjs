// Provisionamiento explicito por operador. No expone registro publico ni contrasenas.
const { parseArgs }=require('node:util');
const source=require('../dist/database/migration-data-source').default;
const {permissionCodes}=require('../dist/resources/resource-registry');
const {values}=parseArgs({options:{issuer:{type:'string'},subject:{type:'string'},email:{type:'string'},organization:{type:'string'},apply:{type:'boolean',default:false}}});
async function main(){
  for(const key of ['issuer','subject','email','organization'])if(!values[key])throw new Error(`Falta --${key}`);
  if(!values.apply){console.log('Validacion completada. Agregue --apply para crear la organizacion y vincular esta identidad OIDC.');return;}
  await source.initialize();
  try{
    const result=await source.transaction(async manager=>{
      const existing=await manager.query('SELECT id FROM vet.usuario WHERE proveedor_identidad=$1 AND identificador_externo=$2',[values.issuer,values.subject]);
      if(existing.length)throw new Error('La identidad ya existe. Gestionar membresias desde un administrador existente.');
      const [user]=await manager.query('INSERT INTO vet.usuario(proveedor_identidad,identificador_externo,nombre,email) VALUES($1,$2,$3,$4) RETURNING id',[values.issuer,values.subject,'Administrador inicial',values.email]);
      await manager.query("SELECT set_config('app.usuario_id',$1,true)",[user.id]);
      const [org]=await manager.query('INSERT INTO vet.organizacion(nombre) VALUES($1) RETURNING id',[values.organization]);
      const [member]=await manager.query('INSERT INTO vet.membresia(organizacion_id,usuario_id) VALUES($1,$2) RETURNING id',[org.id,user.id]);
      const [role]=await manager.query("INSERT INTO vet.rol(organizacion_id,nombre) VALUES($1,'Administrador inicial') RETURNING id",[org.id]);
      await manager.query('INSERT INTO vet.rol_permiso(organizacion_id,rol_id,permiso_id) SELECT $1,$2,id FROM vet.permiso WHERE codigo=ANY($3::text[])',[org.id,role.id,permissionCodes()]);
      await manager.query('INSERT INTO vet.asignacion_rol(organizacion_id,membresia_id,rol_id) VALUES($1,$2,$3)',[org.id,member.id,role.id]);
      return {organizationId:org.id,userId:user.id};
    });
    console.log(JSON.stringify(result,null,2));
  }finally{await source.destroy();}
}
main().catch(error=>{console.error(error instanceof Error?error.message:'Fallo de aprovisionamiento');process.exitCode=1;});
