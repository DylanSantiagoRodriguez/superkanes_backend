// Integracion real; todos los datos sinteticos se revierten al finalizar.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const source = require('../dist/database/migration-data-source').default;
const { DatabaseService } = require('../dist/database/database.service');
const { DataSource } = require('typeorm');

async function main() {
  await source.initialize();
  const app = new DataSource({
    ...source.options, username: 'superkanes_app',
    password: process.env.POSTGRES_APP_PASSWORD,
    migrations: [], logging: false,
  });
  const runner = source.createQueryRunner();
  try {
    await app.initialize();
    const service = new DatabaseService(app);
    await service.checkReadiness();
    const context = { organizationId: randomUUID(), userId: randomUUID(), requestId: randomUUID() };
    await service.withTenant(context, async (manager) => {
      const [row] = await manager.query("SELECT current_setting('app.organizacion_id') AS org");
      assert.equal(row.org, context.organizationId);
    });
    assert.equal((await app.query("SELECT nullif(current_setting('app.organizacion_id',true),'') AS org"))[0].org, null);
    await assert.rejects(service.withTenant(context, () => Promise.reject(new Error('rollback-test'))), /rollback-test/);
    assert.equal((await app.query("SELECT nullif(current_setting('app.organizacion_id',true),'') AS org"))[0].org, null);

    await runner.connect();
    await runner.startTransaction();
    const ids = [randomUUID(), randomUUID()];
    for (const org of ids) {
      await runner.query("INSERT INTO vet.organizacion(id,nombre) VALUES($1,'Prueba transaccional')", [org]);
      await runner.query("INSERT INTO vet.tutor(organizacion_id,nombres,apellidos) VALUES($1,'Sintetico','Prueba')", [org]);
    }
    await runner.query('SET LOCAL ROLE superkanes_app');
    assert.equal((await runner.query('SELECT id FROM vet.tutor')).length, 0);
    await runner.query("SELECT set_config('app.organizacion_id',$1,true)", [ids[0]]);
    const visible = await runner.query('SELECT organizacion_id FROM vet.tutor');
    assert.deepEqual(visible.map((row) => row.organizacion_id), [ids[0]]);
    await runner.query('SAVEPOINT cross_tenant');
    await assert.rejects(runner.query("INSERT INTO vet.tutor(organizacion_id,nombres,apellidos) VALUES($1,'No','Permitido')", [ids[1]]), /row-level security/i);
    await runner.query('ROLLBACK TO SAVEPOINT cross_tenant');
    console.log('OK: TypeORM real, readiness, COMMIT/ROLLBACK sin fuga de contexto, RLS lectura/escritura entre clinicas. Datos de prueba revertidos.');
  } finally {
    if (runner.isTransactionActive) await runner.rollbackTransaction();
    await runner.release();
    if (app.isInitialized) await app.destroy();
    await source.destroy();
  }
}
main().catch(() => { console.error('Fallo en integracion TypeORM/PostgreSQL. Revisar entorno y permisos.'); process.exitCode = 1; });
