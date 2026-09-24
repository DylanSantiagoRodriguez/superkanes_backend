const { parseArgs }=require('node:util');
const { randomUUID }=require('node:crypto');
const { isEmail }=require('class-validator');
const source=require('../dist/database/migration-data-source').default;
source.setOptions({logging:false});
const { PasswordService }=require('../dist/auth/password.service');
const { permissionCodes }=require('../dist/resources/resource-registry');
const readSecret=require('./read-secret.cjs');
const {values}=parseArgs({options:{email:{type:'string'},organization:{type:'string'},name:{type:'string',default:'Administrador'},'platform-admin':{type:'boolean',default:false},'password-stdin':{type:'boolean',default:false},apply:{type:'boolean',default:false}}});
async function main(){
  if(!values.email||!isEmail(values.email)||!values.organization?.trim())throw new Error('Se requieren --email valido y --organization');
  if(!values.apply){console.log('Argumentos validos. --apply crea la cuenta y clinica; --platform-admin habilita gestion de usuarios. La contrasena se solicita sin mostrarla.');return;}
  const password=await readSecret(values['password-stdin']);
  const service=new PasswordService();const email=values.email.trim().toLowerCase();
  service.assertPolicy(password,email);const hash=await service.hash(password);
  await source.initialize();
  try{
    const result=await source.transaction(async manager=>{
      const existing=await manager.query("SELECT id FROM vet.usuario WHERE proveedor_identidad='local' AND lower(btrim(email))=$1",[email]);
      if(existing.length)throw new Error('Ya existe una cuenta local con ese correo. No se modifica.');
      const user=randomUUID();
      await manager.query("INSERT INTO vet.usuario(id,proveedor_identidad,identificador_externo,nombre,email) VALUES($1::uuid,'local',$1::uuid::text,$2,$3)",[user,values.name,email]);
      await manager.query('INSERT INTO auth.credential(usuario_id,password_hash,platform_admin) VALUES($1,$2,$3)',[user,hash,values['platform-admin']]);
      await manager.query("SELECT set_config('app.usuario_id',$1,true)",[user]);
      const [org]=await manager.query('INSERT INTO vet.organizacion(nombre) VALUES($1) RETURNING id',[values.organization]);
      const [member]=await manager.query('INSERT INTO vet.membresia(organizacion_id,usuario_id) VALUES($1,$2) RETURNING id',[org.id,user]);
      const [role]=await manager.query("INSERT INTO vet.rol(organizacion_id,nombre) VALUES($1,'Administrador inicial') RETURNING id",[org.id]);
      await manager.query('INSERT INTO vet.rol_permiso(organizacion_id,rol_id,permiso_id) SELECT $1,$2,id FROM vet.permiso WHERE codigo=ANY($3::text[])',[org.id,role.id,permissionCodes()]);
      await manager.query('INSERT INTO vet.asignacion_rol(organizacion_id,membresia_id,rol_id) VALUES($1,$2,$3)',[org.id,member.id,role.id]);
      await manager.query("INSERT INTO auth.security_event(usuario_id,action) VALUES($1,'BOOTSTRAP_ACCOUNT')",[user]);
      return {userId:user,organizationId:org.id,roleId:role.id};
    });console.log(JSON.stringify(result,null,2));
  }finally{await source.destroy();}
}
main().catch(()=>{console.error('No se pudo aprovisionar. Verifique argumentos, politica de contrasena, duplicados y migraciones. No se muestran consultas ni credenciales.');process.exitCode=1;});
