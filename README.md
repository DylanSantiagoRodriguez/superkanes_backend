# Superkanes Backend

NestJS 11, TypeScript, Node.js 24 y PostgreSQL. Ver [guía de arranque](../README.md).

## Estructura inicial

```text
src/
  config/       Validación de variables de entorno
  auth/         Contraseñas Argon2id, JWT, sesiones y guard global
  resources/    Contratos, permisos, reglas de negocio, CRUD y OpenAPI
  modules/      47 módulos explícitos: entidad, controlador, servicio y DTO
  common/       Validadores y DTO de consultas compartidos
  database/     TypeORM, migraciones y transacciones con contexto de clínica
  health/       Estado del proceso y disponibilidad de BD
  app.module.ts Composición del monolito modular
  setup-app.ts  Prefijo, validación HTTP, CORS, Helmet y Swagger
  main.ts       Arranque y cierre ordenado
```

Se utiliza `@nestjs/typeorm` y TypeORM, con `pg` como driver. `synchronize` y `migrationsRun` están desactivados en la API. La migración inicial incorpora el esquema SQL diseñado, incluyendo triggers y RLS. Las migraciones se ejecutan desde el proyecto NestJS, con una conexión de propietario separada de la conexión de la API.

Ver [guía de migraciones](MIGRATIONS.md). Las 47 tablas tienen clases `@Entity`, columnas y relaciones explícitas en `src/modules`. Cada módulo registra su entidad mediante `TypeOrmModule.forFeature`, su controlador, servicio y DTO de creación, actualización y respuesta. El esquema inicial se conserva mediante migraciones SQL. Ver [estructura de módulos](MODULOS.md), [contrato y ejemplos de la API](CRUD.md) y [matriz de operaciones por tabla](CRUD_RECURSOS.md).

## Comandos desde esta carpeta

```powershell
npm.cmd ci
npm.cmd run start:dev
npm.cmd run build
npm.cmd run start:prod
npm.cmd run lint
npm.cmd test -- --runInBand
npm.cmd run test:e2e -- --runInBand
npm.cmd run test:integration
npm.cmd run test:crud
npm.cmd run test:auth
npm.cmd run migration:show
npm.cmd run migration:run
```

El archivo de entorno raíz `../.env` se carga automáticamente en desarrollo. Las variables del proceso tienen prioridad. Compose proporciona directamente las variables necesarias; `.env` no se copia a la imagen.

`/api/v1/health/live` indica si HTTP funciona. `/api/v1/health/ready` verifica conexión, tablas esenciales y un rol sin privilegios de superusuario ni bypass de RLS. Un fallo devuelve 503 sin detalles de infraestructura. Liveness no depende de PostgreSQL.

Swagger: `/api/docs` cuando `SWAGGER_ENABLED=true`. Incluye autenticación local y los 47 recursos. Generar la clave JWT y aprovisionar al administrador según [AUTENTICACION.md](AUTENTICACION.md). Los CRUD requieren JWT, membresía y permisos; las altas usan Idempotency-Key y las modificaciones If-Match.

## Acceso a datos por organización

`DatabaseService.withTenant()` recibe un contexto previamente autenticado y autorizado. Utiliza `DataSource.transaction()` y establece organización, usuario y petición con `set_config(..., true)`. TypeORM administra COMMIT, ROLLBACK y la conexión. Dentro del callback se debe usar exclusivamente el `EntityManager` recibido y sus repositorios, nunca un repositorio global fuera de esa transacción.

No crear este contexto desde datos no verificados de una petición. La función valida formato UUID, pero **no autentica ni verifica membresías**. Los endpoints usan `ResourceAccessService.run()`, que resuelve la identidad autenticada, verifica membresía y permisos y ejecuta la operación en una transacción. Las escrituras de tablas globales se reservan al operador de plataforma; no conceder superusuario a la API.

Las pruebas unitarias verifican esta frontera con TypeORM simulado; las pruebas HTTP simulan disponibilidad de BD. `test:integration` conecta al PostgreSQL real, comprueba el contexto después de COMMIT/ROLLBACK y verifica aislamiento de lectura y escritura. Los datos sintéticos se revierten al finalizar.

TypeORM establece conexión durante el arranque; una BD inaccesible puede impedir iniciar la aplicación. Una vez iniciado el proceso, liveness no consulta PostgreSQL y readiness sí lo hace.

## Extensión del backend

Los contratos comunes cubren identidad, tutores, mascotas, historia, vacunas, agenda y peluquería. Los procesos adicionales de carga de archivos, generación de reportes y envío de comunicaciones deben implementarse como casos de uso con autorización explícita. La tabla disponible no implica que su proceso completo esté implementado.

`test:crud` verifica JWT firmado, HTTP y PostgreSQL reales en una base temporal: 47 listados, altas de los 44 tipos permitidos, GET/PATCH, bajas, aislamiento, versiones y reglas clínicas. El contenedor se ejecuta como usuario `node`; la API no recibe las credenciales del propietario de PostgreSQL.
