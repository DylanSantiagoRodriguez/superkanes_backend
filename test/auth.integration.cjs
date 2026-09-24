const assert=require('node:assert/strict');
const {randomUUID,randomBytes}=require('node:crypto');
const {DataSource}=require('typeorm');
const source=require('../dist/database/migration-data-source').default;
const {PasswordService}=require('../dist/auth/password.service');

async function main(){
 const name='superkanes_auth_test_'+randomUUID().replaceAll('-','');
 let created=false,owner,app,checks=0;
 const user=randomUUID(),org=randomUUID();
 const password='Frase sintetica segura para pruebas 2026!';
 const changed='Otra frase sintetica segura para pruebas 2027!';
 const recovered='Recuperacion sintetica segura para pruebas 2028!';
 try{
  source.setOptions({logging:false});await source.initialize();await source.query(`CREATE DATABASE "${name}"`);created=true;
  owner=new DataSource({...source.options,database:name,logging:false});await owner.initialize();await owner.runMigrations();
  const hashes=new PasswordService();const hash=await hashes.hash(password);
  await owner.query("INSERT INTO vet.usuario(id,proveedor_identidad,identificador_externo,nombre,email) VALUES($1::uuid,'local',$1::uuid::text,'Admin prueba','admin@example.test')",[user]);
  await owner.query('INSERT INTO auth.credential(usuario_id,password_hash,platform_admin) VALUES($1,$2,true)',[user,hash]);
  await owner.query("INSERT INTO vet.organizacion(id,nombre) VALUES($1,'Clinica de prueba')",[org]);
  await owner.query('INSERT INTO vet.membresia(organizacion_id,usuario_id) VALUES($1,$2)',[org,user]);
  Object.assign(process.env,{NODE_ENV:'test',DB_HOST:'127.0.0.1',POSTGRES_DB:name,AUTH_JWT_SECRET:randomBytes(64).toString('base64'),AUTH_ISSUER:'integration-local',AUTH_AUDIENCE:'integration-local',SWAGGER_ENABLED:'true',CORS_ORIGINS:'http://localhost:5173'});
  const {spawnSync}=require('node:child_process');
  const bootstrap=spawnSync(process.execPath,['scripts/provision-local-admin.cjs','--email','bootstrap@example.test','--organization','Bootstrap test','--platform-admin','--password-stdin','--apply'],{cwd:require('node:path').resolve(__dirname,'..'),env:process.env,input:password+'\n',encoding:'utf8'});
  assert.equal(bootstrap.status,0,bootstrap.stderr);
  const bootIds=JSON.parse(bootstrap.stdout);
  const [bootCredential]=await owner.query('SELECT password_hash,platform_admin FROM auth.credential WHERE usuario_id=$1',[bootIds.userId]);
  assert.equal(bootCredential.platform_admin,true);assert.equal(await hashes.verify(password,bootCredential.password_hash),true);checks++;
  const {NestFactory}=require('@nestjs/core');const {AppModule}=require('../dist/app.module');const {configureApp}=require('../dist/setup-app');
  app=await NestFactory.create(AppModule,{logger:false});configureApp(app);await app.listen(0,'127.0.0.1');const base=await app.getUrl();
  async function req(path,body,status=200,token,extra={},method='POST'){
   const res=await fetch(base+'/api/v1/auth'+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});
   const value=res.status===204?null:await res.json();
   assert.equal(res.status,status,method+' '+path+': '+JSON.stringify(value?.message));checks++;return {value,res};
  }
  const login=async(email,pwd)=> (await req('/login',{email,password:pwd,client:'native'})).value;
  let admin=await login('ADMIN@example.test',password);
  assert.equal(admin.expiresIn,900);assert.equal(admin.refreshToken.length,64);
  const {decodeJwt}=await import('jose');const jwt=decodeJwt(admin.accessToken);
  assert.equal(jwt.sub,user);assert.equal(jwt.exp-jwt.iat,900);assert.equal(jwt.password,undefined);
  const wrong=await req('/login',{email:'admin@example.test',password:'incorrecta',client:'native'},401);
  const unknown=await req('/login',{email:'missing@example.test',password:'incorrecta',client:'native'},401);
  assert.equal(wrong.value.message,unknown.value.message);
  const me=await req('/me',undefined,200,admin.accessToken,{},'GET');assert.equal(me.value.id,user);assert.equal(me.value.organizations[0].id,org);
  await req('/me',undefined,401,admin.accessToken.slice(0,-8)+'invalidx',{},'GET');
  await req('/users',{nombre:'Staff',email:'staff@example.test',password,organizacion_id:org,platform_admin:true},400,admin.accessToken);
  await req('/users',{nombre:'Staff',email:'staff@example.test',password:'short',organizacion_id:org},400,admin.accessToken);
  const staff=(await req('/users',{nombre:'Staff',email:'staff@example.test',password,organizacion_id:org},201,admin.accessToken)).value;
  assert.equal(staff.password,undefined);assert.equal(staff.password_hash,undefined);
  await req('/users',{nombre:'Duplicate',email:'STAFF@example.test',password,organizacion_id:org},409,admin.accessToken);
  const [credential]=await owner.query('SELECT * FROM auth.credential WHERE usuario_id=$1',[staff.id]);
  assert.ok(credential.password_hash.startsWith('$argon2id$v=19$'));
  assert.deepEqual(credential.password_hash.split('$')[3].split(',').sort(), ['m=65536','p=1','t=3']);
  assert.notEqual(credential.password_hash,hash);assert.equal(credential.platform_admin,false);
  let regular=await login('staff@example.test',password);
  await req('/users',{nombre:'No',email:'no@example.test',password,organizacion_id:org},403,regular.accessToken);
  // Rotacion y reutilizacion: un token consumido revoca toda su sesion.
  const rotated=(await req('/refresh',{refreshToken:admin.refreshToken,client:'native'})).value;
  assert.notEqual(rotated.refreshToken,admin.refreshToken);
  await req('/refresh',{refreshToken:admin.refreshToken,client:'native'},401);
  await req('/me',undefined,401,rotated.accessToken,{},'GET');
  await req('/refresh',{refreshToken:rotated.refreshToken,client:'native'},401);
  admin=await login('admin@example.test',password);
  // Cambio exige contrasena actual e invalida JWT y refresh anteriores.
  await req('/password/change',{currentPassword:'incorrecta',newPassword:changed},401,regular.accessToken);
  await req('/password/change',{currentPassword:password,newPassword:changed},204,regular.accessToken);
  await req('/me',undefined,401,regular.accessToken,{},'GET');
  await req('/refresh',{refreshToken:regular.refreshToken,client:'native'},401);
  regular=await login('staff@example.test',changed);
  const reset=(await req('/users/'+staff.id+'/reset-token',{currentPassword:password},201,admin.accessToken)).value;
  assert.equal(reset.token.length,64);
  await req('/password/reset',{token:reset.token,newPassword:recovered},204);
  await req('/password/reset',{token:reset.token,newPassword:recovered},401);
  await req('/me',undefined,401,regular.accessToken,{},'GET');
  regular=await login('staff@example.test',recovered);
  await req('/logout',{},204,regular.accessToken);
  await req('/refresh',{refreshToken:regular.refreshToken,client:'native'},401);
  await req('/me',undefined,401,regular.accessToken,{},'GET');
  // Cookies HttpOnly y defensa CSRF para web.
  const headers={Origin:'http://localhost:5173','X-CSRF-Protection':'1'};
  const web=await req('/login',{email:'admin@example.test',password},200,undefined,headers);
  assert.equal(web.value.refreshToken,undefined);assert.equal(web.res.headers.get('cache-control'),'no-store');
  const cookie=web.res.headers.get('set-cookie');assert.match(cookie,/HttpOnly/i);assert.match(cookie,/SameSite=Strict/i);
  await req('/refresh',{},403,undefined,{Cookie:cookie.split(';')[0]});
  const webRefresh=await req('/refresh',{},200,undefined,{...headers,Cookie:cookie.split(';')[0]});
  assert.equal(webRefresh.value.refreshToken,undefined);
  await req('/logout-all',{},204,admin.accessToken);
  await req('/me',undefined,401,webRefresh.value.accessToken,{},'GET');
  // Bloqueo por cuenta distribuido, incluso desde IP distintas.
  const {AuthService}=require('../dist/auth/auth.service');const service=app.get(AuthService);
  for(let i=0;i<5;i++) await assert.rejects(service.login('staff@example.test','incorrecta','ip-'+i),/Credenciales/);
  await assert.rejects(service.login('staff@example.test',recovered,'another-ip'),/Credenciales/);checks+=6;
  // Carrera de renovacion: una sola solicitud consume el refresh; la otra revoca.
  const {TokenService}=require('../dist/auth/token.service');
  const native=await service.login('admin@example.test',password,'concurrency-test');
  const concurrent=await Promise.allSettled([service.refresh(native.refreshToken,'test-a'),service.refresh(native.refreshToken,'test-b')]);
  assert.equal(concurrent.filter(r=>r.status==='fulfilled').length,1);
  const winner=concurrent.find(r=>r.status==='fulfilled').value;
  await assert.rejects(app.get(TokenService).verify(winner.accessToken));checks+=2;
  // Desactivar usuario invalida inmediatamente sesiones nuevas.
  const active=await service.login('admin@example.test',password,'disable-test');
  await owner.query('UPDATE vet.usuario SET activo=false WHERE id=$1',[user]);
  await req('/me',undefined,401,active.accessToken,{},'GET');
  await req('/refresh',{refreshToken:active.refreshToken,client:'native'},401);
  const events=await owner.query('SELECT action FROM auth.security_event');assert.ok(events.some(x=>x.action==='REFRESH_REUSE'));
  const rows=await owner.query('SELECT token_hash FROM auth.refresh_token');assert.ok(rows.every(x=>/^[a-f0-9]{64}$/.test(x.token_hash)));
  let rateLimited=false;
  for(let i=0;i<12;i++){
   const res=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'missing@example.test',password:'incorrecta',client:'native'})});
   checks++;if(res.status===429){rateLimited=true;break;}assert.equal(res.status,401);
  }
  assert.equal(rateLimited,true);
  console.log(`OK: ${checks} comprobaciones de autenticacion; Argon2id, JWT, permisos, revocacion, rotacion concurrente, recuperacion, cookies y limites de intentos.`);
 }finally{
  if(app)await app.close();if(owner?.isInitialized)await owner.destroy();
  if(created&&/^superkanes_auth_test_[a-f0-9]{32}$/.test(name))await source.query(`DROP DATABASE "${name}" WITH (FORCE)`);
  if(source.isInitialized)await source.destroy();
 }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
