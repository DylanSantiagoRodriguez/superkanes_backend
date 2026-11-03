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

### Datos de demostración locales

Con Node.js 24 y la base migrada, `npm run seed:demo` valida la carga y revierte la transacción. Para guardar los datos, ejecuta `npm run seed:demo -- --apply` desde esta carpeta. Usa la conexión de propietario configurada para migraciones y solo admite PostgreSQL en `localhost` o `127.0.0.1`, fuera de producción.

La carga crea tres ejemplos relacionados por catálogo y registro operativo (mascotas, tutores, sedes, profesionales, citas, historia clínica, vacunación y peluquería), identificados como DEMO. Se puede repetir sin duplicarlos ni sobrescribir registros existentes. Las fechas de los ejemplos son octubre y noviembre de 2026.

Por defecto utiliza la organización del usuario `admin@superkanes.local`; puedes indicar `--email` y, si tiene varias organizaciones, `--organization` con el UUID correspondiente. Para crear atenciones desde esa cuenta, selecciona su profesional asociado: `Administrador · DEMO (tu usuario)`. Los otros dos profesionales tienen perfiles auxiliares sin credenciales ni roles de acceso. No se generan firmas, archivos, reportes emitidos ni envíos ficticios; los datos clínicos son sintéticos.

### Desarrollo y comprobaciones

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

Swagger: `/api/docs` cuando `SWAGGER_ENABLED=true`. Incluye autenticación local y los 47 recursos. Generar la clave JWT y aprovisionar al administrador según [AUTENTICACION.md](AUTENTICACION.md). Los CRUD requieren JWT, membresía y permisos; las altas usan Idempotency-Key y las modificaciones If-Match. Una versión desactualizada devuelve 412.

`GET /api/v1/resources` devuelve el catálogo autorizado para la organización: permisos efectivos de creación, edición y baja; campos obligatorios y gestionados por el servidor; referencias; valores por defecto; transiciones y efecto de la baja. Incluye `tutor_principal_id` como entrada obligatoria del alta de mascotas. El frontend consume este contrato; la API vuelve a comprobar permisos y reglas en cada petición. Las pruebas CRUD contrastan sus campos obligatorios con los DTO publicados en OpenAPI.

## Acceso a datos por organización

`DatabaseService.withTenant()` recibe un contexto previamente autenticado y autorizado. Utiliza `DataSource.transaction()` y establece organización, usuario y petición con `set_config(..., true)`. TypeORM administra COMMIT, ROLLBACK y la conexión. Dentro del callback se debe usar exclusivamente el `EntityManager` recibido y sus repositorios, nunca un repositorio global fuera de esa transacción.

No crear este contexto desde datos no verificados de una petición. La función valida formato UUID, pero **no autentica ni verifica membresías**. Los endpoints usan `ResourceAccessService.run()`, que resuelve la identidad autenticada, verifica membresía y permisos y ejecuta la operación en una transacción. Las escrituras de tablas globales se reservan al operador de plataforma; no conceder superusuario a la API.

Las pruebas unitarias verifican esta frontera con TypeORM simulado; las pruebas HTTP simulan disponibilidad de BD. `test:integration` conecta al PostgreSQL real, comprueba el contexto después de COMMIT/ROLLBACK y verifica aislamiento de lectura y escritura. Los datos sintéticos se revierten al finalizar.

TypeORM establece conexión durante el arranque; una BD inaccesible puede impedir iniciar la aplicación. Una vez iniciado el proceso, liveness no consulta PostgreSQL y readiness sí lo hace.

## Extensión del backend

Los contratos comunes cubren identidad, tutores, mascotas, historia, vacunas, agenda y peluquería. Los procesos adicionales de carga de archivos, generación de reportes y envío de comunicaciones deben implementarse como casos de uso con autorización explícita. La tabla disponible no implica que su proceso completo esté implementado.

`test:crud` verifica JWT firmado, HTTP y PostgreSQL reales en una base temporal: 47 listados, altas de los 44 tipos permitidos, GET/PATCH, bajas, aislamiento, versiones y reglas clínicas. El contenedor se ejecuta como usuario `node`; la API no recibe las credenciales del propietario de PostgreSQL.

## Fotos de pacientes, MinIO y documentos clínicos

La ficha de mascota permite subir una foto principal junto al nombre y demás datos del paciente. Se reutiliza `foto_archivo_id`: los archivos están en MinIO y sus metadatos en PostgreSQL. Se aceptan JPEG, PNG y WebP de hasta 10 MiB y 40 megapíxeles; el servidor decodifica, retira metadatos, reduce a 2400 px y guarda WebP con SHA-256. No se admiten SVG ni imágenes animadas. La foto se vincula al pulsar **Guardar** en la ficha; quitarla o sustituirla conserva el archivo anterior.

En **Historia clínica → Revisiones clínicas → Nuevo registro / Editar**, el campo **Documento de historia clínica** ofrece títulos, negrita, cursiva, subrayado, listas, alineación y una estructura clínica inicial. Admite hasta 200.000 caracteres de texto y 1 MiB de JSON. Guarda explícitamente con el botón del formulario; no hay autoguardado ni edición simultánea en tiempo real. Se mantienen los campos clínicos anteriores, `If-Match`, auditoría y la inmutabilidad de revisiones cerradas. La vista de detalle muestra el formato guardado.

### Arranque Docker en una instalación nueva

Requiere Docker Compose moderno (incluido con Docker Desktop / OrbStack) y las credenciales PostgreSQL de `.env` completas. No copiar `.env.example` sobre una configuración existente.

```sh
# Desde superkanes_backend/, después de npm ci
npm run auth:setup
npm run storage:setup
docker compose up -d --build
```

Servicios locales: aplicación Docker `http://127.0.0.1:5173`, API `http://localhost:3000/api/v1`, MinIO S3 `http://localhost:9000`, consola MinIO `http://localhost:9001`. PostgreSQL aislado se publica en `localhost:5433`. Si ya tienes Vite escuchando en IPv6, `localhost:5173` puede abrir ese servidor; la dirección `127.0.0.1:5173` abre Docker. Los puertos se pueden cambiar mediante las variables `*_PORT` de Compose. Para cambiar el origen web, actualizar también `CORS_ORIGINS`.

`storage:setup` genera contraseñas aleatorias sin imprimirlas y conserva las existentes. La consola usa `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` de `.env`. La API solo recibe `S3_ACCESS_KEY` / `S3_SECRET_KEY`, con acceso de lectura/escritura al bucket, sin administración ni borrado. No usar variables `VITE_` para secretos. El bucket es privado y tiene versionado; el navegador carga fotos a través de la API autenticada, sin credenciales S3 ni URLs públicas.

MinIO y `mc` se compilan desde versiones oficiales fijadas en `docker/*.Dockerfile`; la primera compilación tarda varios minutos. Las imágenes históricas públicas ya no se pudieron descargar al verificar esta integración. Se utiliza la [versión oficial con corrección de seguridad de octubre de 2025](https://github.com/minio/minio/releases/tag/RELEASE.2025-10-15T17-29-55Z). El repositorio comunitario está archivado; revisar su mantenimiento antes de un despliegue de producción. Compose configura un entorno local, con puertos limitados a loopback.

### Usar los datos locales existentes

Si PostgreSQL ya funciona en el host usando las credenciales de `.env`, usar la variante que conecta a esa base en lugar de inicializar otra:

```sh
docker compose -f compose.yaml -f compose.existing-db.yaml up -d --build
```

El servicio `migrate` aplica las migraciones pendientes con el propietario y termina antes de arrancar HTTP. La API utiliza exclusivamente `superkanes_app` con RLS. Esta variante no copia ni reemplaza datos.

Para incorporar un volumen existente a Compose, configurar `POSTGRES_IMAGE`, `POSTGRES_VOLUME_NAME`, `POSTGRES_VOLUME_EXTERNAL=true` y `POSTGRES_DOCKER_PORT` con la versión PostgreSQL compatible, el nombre del volumen y el puerto local. No montar un volumen de PostgreSQL en dos servidores simultáneamente. La variante `compose.existing-db.yaml` es para bases que continúan ejecutándose fuera de este Compose.

Para desarrollo con Node.js 24 y PostgreSQL local:

```sh
docker compose up -d minio minio-init
npm run migration:run
npm run start:dev
# En otra terminal: cd ../superkanes_frontend && npm run dev
```

Una instalación nueva tiene la base vacía. Crear su primer usuario con el script existente (contraseña solicitada en terminal, nunca como argumento):

```sh
POSTGRES_PORT=5433 npm run admin:provision -- --email admin@tuclinica.com --organization 'Tu clínica' --apply
```

### Contratos y operación

- `POST /api/v1/storage/photos`: multipart con un único campo `file`, JWT, `X-Organization-Id` e `Idempotency-Key` UUID; requiere `archivo.create` y `archivo.read` de organización. Devuelve `{data: archivo}` tras persistir objeto y metadatos. Repetir la misma clave/carga devuelve el mismo archivo durante 24 horas; cambiar la carga con esa clave devuelve 409.
- `GET /api/v1/storage/:id/content`: requiere `archivo.read`, devuelve imagen WebP con `Cache-Control: private, no-store`; comprueba organización, bucket, estado, categoría y hash. No permite acceder anónimamente.
- `POST/PATCH /api/v1/resources/revision_clinica`: acepta `documento` nullable con un subconjunto validado de JSON Tiptap. Rechaza HTML estructural, enlaces, medios embebidos, atributos ajenos y tamaños excesivos. Los textos se muestran como texto; no se inyecta HTML del usuario.
- La subida de la imagen y el guardado de la ficha son pasos distintos: un abandono del formulario puede dejar un archivo privado sin vínculo. Un fallo de PostgreSQL después de subir a S3 también puede dejar un objeto sin metadatos. No se borra automáticamente por riesgo de perder evidencia tras un resultado de commit incierto. Revisar archivos/objetos sin referencia, antigüedad y respaldos antes de eliminarlos.
- Conservar y respaldar **ambos** volúmenes: PostgreSQL y MinIO. `docker compose down` los conserva; `down -v` elimina los volúmenes administrados por Compose; el volumen externo existente se conserva. La migración `ClinicalDocument1793700000000` es aditiva; su reversión automática está bloqueada para preservar historias. Ante una incidencia, restaurar un respaldo coherente o aplicar una migración correctiva.
- Para desactivar temporalmente almacenamiento en Node, usar `S3_ENABLED=false`: las demás funciones siguen disponibles; las cargas devuelven 503. Compose habilita MinIO explícitamente.

### Verificación

```sh
npm run build
npm run lint
npm test -- --runInBand
# Ajustar POSTGRES_PORT al puerto de la base local; Compose usa 5433 por defecto.
# Cada suite HTTP crea y elimina una BD temporal.
POSTGRES_PORT=5433 TEST_STORAGE=true npm run test:crud
POSTGRES_PORT=5433 npm run test:auth
POSTGRES_PORT=5433 npm run test:integration
```

La suite de fotos usa MinIO real y elimina solo sus propios objetos al terminar. Para verificar además la UI con Chromium: en el frontend ejecutar `npx playwright install chromium` y `npm run dev -- --port 5174`; luego ejecutar en backend `POSTGRES_PORT=5433 TEST_STORAGE=true TEST_BROWSER=true npm run test:crud`. La sesión de prueba se inyecta en el navegador, mientras las lecturas/escrituras de pacientes y documentos usan la API y la base temporal reales. El login tiene su propia suite de autenticación.

### Historia directamente desde una atención

**Historia clínica → Atenciones clínicas → Nuevo registro** ahora permite redactar el documento en el mismo formulario. **Ir al documento** lleva al editor, que trae una estructura clínica inicial. **Guardar atención e historia** crea la atención y su primera revisión en una sola transacción; requiere `atencion_clinica.create` y `revision_clinica.create`, con su alcance de sede. Los reintentos usan una única `Idempotency-Key`.

El profesional se obtiene de la sesión mediante `GET /resources/atencion_clinica/autor`: no se ofrecen autores ajenos a la cuenta. Si no hay perfil vinculado, se muestra una indicación para solicitarlo al administrador. El servidor sigue verificando autoría. El nuevo endpoint `POST /resources/atencion_clinica/con-historia` añade `motivo_consulta` y `documento` al contrato de alta de atención; el CRUD anterior permanece compatible.

En **Ver detalle** de una atención, **Leer historia** y **Editar historia** permiten acceder a sus revisiones. Las revisiones cerradas solo admiten lectura; las correcciones siguen creando una nueva revisión. Si una atención existente todavía no tiene historia, **Escribir historia clínica** abre el formulario con la atención y número inicial preseleccionados.
