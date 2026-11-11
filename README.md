# Superkanes Backend

NestJS 11, TypeScript, Node.js 24 y PostgreSQL. Ver [guía de arranque](../README.md).

## Estructura

```text
src/
  config/       Validación de variables de entorno
  auth/         Contraseñas Argon2id, JWT, sesiones y guard global
  clinical/     Ficha, consulta, agenda, consentimiento y circuito de laboratorio
  storage/      Fotos, adjuntos privados y emisión de PDF clínicos
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

## Usuarios con acceso a varias organizaciones

El operador de plataforma dispone de **Usuarios y accesos** (también en **Configuración → Usuarios**). Puede crear una cuenta con nombre, correo y contraseña inicial, o buscar una cuenta existente por nombre/correo. Selecciona una o varias organizaciones activas y un rol para cada una. Los vínculos abarcan todas las sedes de la organización. La cuenta conserva su contraseña y sus roles anteriores; al vincular la propia cuenta se actualiza el selector de organizaciones sin cerrar sesión.

Si una organización todavía no tiene roles, puede crearse su primer **Administrador de organización** en la misma operación. Este rol administra sus recursos sin conceder privilegios de operador de plataforma. Las membresías inactivas requieren reactivación explícita desde Configuración; las cuentas inactivas o sin credenciales locales no se habilitan automáticamente.

Endpoints exclusivos del operador, con JWT:

- `GET /api/v1/auth/admin/users?search=...&after=...`: búsqueda por nombre/correo, páginas de 25 y cursor `page.next`.
- `GET /api/v1/auth/admin/organizations?usuario_id=...&after=...`: organizaciones activas, roles disponibles y vínculos del usuario, incluso sin membresía del operador en la organización destino.
- `POST /api/v1/auth/admin/users`: `{nombre,email,password,organizaciones:[{organizacion_id,rol_id}]}`.
- `POST /api/v1/auth/admin/users/:id/organizations`: `{organizaciones:[{organizacion_id,rol_id}]}`.

En una organización sin roles, sustituye `rol_id` por `crear_rol_administrador:true`. Ambos POST requieren `Idempotency-Key` UUID y admiten hasta 20 organizaciones distintas. La creación de cuenta, credencial, membresías y roles ocurre en una transacción: un vínculo inválido revierte toda la operación. Los reintentos no duplican cuentas ni asignaciones. Los roles se verifican dentro de su organización y las escrituras conservan la auditoría. No requiere migraciones nuevas.

`test/user-management.integration.cjs`, ejecutado por `test:crud`, cubre creación, vinculación, aislamiento, rollback, contraseña, permisos, concurrencia, paginación e idempotencia. Con `TEST_BROWSER=true` añade comprobaciones del flujo y presentación móvil desde Chromium. Solo usa la base temporal de pruebas.

## Acceso a datos por organización

`DatabaseService.withTenant()` recibe un contexto previamente autenticado y autorizado. Utiliza `DataSource.transaction()` y establece organización, usuario y petición con `set_config(..., true)`. TypeORM administra COMMIT, ROLLBACK y la conexión. Dentro del callback se debe usar exclusivamente el `EntityManager` recibido y sus repositorios, nunca un repositorio global fuera de esa transacción.

No crear este contexto desde datos no verificados de una petición. La función valida formato UUID, pero **no autentica ni verifica membresías**. Los endpoints usan `ResourceAccessService.run()`, que resuelve la identidad autenticada, verifica membresía y permisos y ejecuta la operación en una transacción. Las escrituras de tablas globales se reservan al operador de plataforma; no conceder superusuario a la API.

Las pruebas unitarias verifican esta frontera con TypeORM simulado; las pruebas HTTP simulan disponibilidad de BD. `test:integration` conecta al PostgreSQL real, comprueba el contexto después de COMMIT/ROLLBACK y verifica aislamiento de lectura y escritura. Los datos sintéticos se revierten al finalizar.

TypeORM establece conexión durante el arranque; una BD inaccesible puede impedir iniciar la aplicación. Una vez iniciado el proceso, liveness no consulta PostgreSQL y readiness sí lo hace.

## Extensión del backend

Los contratos comunes cubren identidad, tutores, mascotas, historia, vacunas, agenda y peluquería. La carga de archivos clínicos y la emisión de PDF tienen casos de uso específicos con autorización explícita. El envío de comunicaciones todavía requiere integrar un proveedor. La tabla disponible no implica que su proceso completo esté implementado.

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
# test:crud y test:auth crean y eliminan una BD temporal.
POSTGRES_PORT=5433 TEST_STORAGE=true npm run test:crud
POSTGRES_PORT=5433 npm run test:auth
```

La suite de fotos usa MinIO real y elimina solo sus propios objetos al terminar. Para verificar además la UI con Chromium: en el frontend ejecutar `npx playwright install chromium` y `npm run dev -- --port 5174`; luego ejecutar en backend `POSTGRES_PORT=5433 TEST_STORAGE=true TEST_BROWSER=true npm run test:crud`. La sesión de prueba se inyecta en el navegador, mientras las lecturas/escrituras de pacientes y documentos usan la API y la base temporal reales. El login tiene su propia suite de autenticación.

### Historia directamente desde una atención

**Historia clínica → Atenciones clínicas → Nuevo registro** ahora permite redactar el documento en el mismo formulario. **Ir al documento** lleva al editor, que trae una estructura clínica inicial. **Guardar atención e historia** crea la atención y su primera revisión en una sola transacción; requiere `atencion_clinica.create` y `revision_clinica.create`, con su alcance de sede. Los reintentos usan una única `Idempotency-Key`.

El profesional se obtiene de la sesión mediante `GET /resources/atencion_clinica/autor`: no se ofrecen autores ajenos a la cuenta. Si no hay perfil vinculado, se muestra una indicación para solicitarlo al administrador. El servidor sigue verificando autoría. El nuevo endpoint `POST /resources/atencion_clinica/con-historia` añade `motivo_consulta` y `documento` al contrato de alta de atención; el CRUD anterior permanece compatible.

En **Ver detalle** de una atención, **Leer historia** y **Editar historia** permiten acceder a sus revisiones. Las revisiones cerradas solo admiten lectura; las correcciones siguen creando una nueva revisión. Si una atención existente todavía no tiene historia, **Escribir historia clínica** abre el formulario con la atención y número inicial preseleccionados.

## Consulta veterinaria integrada

Desde **Mascotas → Ver detalle → Abrir ficha clínica** se consultan antecedentes y se inicia una atención con paciente precargado. La consulta reúne notas SOAP, examen físico, mediciones con unidades controladas, diagnósticos, prescripciones, documentos, consentimientos y laboratorio. El profesional se toma de la sesión. El guardado de notas y detalles es transaccional; el cierre conserva un original inmutable. Una corrección copia los registros autorizados a una revisión vinculada y exige motivo.

La especificación y matriz funcional canónicas están en [002-flujo-clinico](../document-management/specs/002-flujo-clinico/spec.md). La aplicación conserva el monolito y las entidades clínicas existentes. Las órdenes, resultados y eventos de laboratorio son un caso de uso específico, fuera del CRUD genérico.

### Contratos incorporados

Todos los caminos siguientes llevan el prefijo `/api/v1`, JWT y `X-Organization-Id`.

| Camino | Operación |
|---|---|
| `GET /resources/clinica/pacientes/:id` | Cabecera y resumen con permisos por fuente |
| `GET /resources/clinica/pacientes/:id/registros/:section` | Historial y secciones paginadas, con búsqueda y fechas |
| `GET /resources/clinica/revisiones/:id` | Notas y detalles autorizados de una revisión |
| `POST /resources/clinica/revisiones/:id/guardar` | Notas y operaciones de detalle atómicas; cierre explícito |
| `POST /resources/clinica/revisiones/:id/corregir` | Corrección vinculada con copia de detalles y motivo |
| `POST /resources/clinica/consentimientos/:id/responder` | Aceptación o rechazo con tutor autorizado y evidencia |
| `GET /resources/clinica/agenda` | Citas en un intervalo máximo de 31 días |
| `PATCH /resources/clinica/citas/:id/llegada` | Llegada con fecha del servidor |
| `GET /resources/clinica/laboratorio/permisos` | Capacidades de laboratorio de la sesión |
| `GET /resources/clinica/laboratorio/atenciones/:id/ordenes` | Órdenes con resultados y trazabilidad |
| `POST /resources/clinica/laboratorio/ordenes` | Solicitud de exámenes |
| `POST /resources/clinica/laboratorio/ordenes/:id/avanzar` | Muestra, proceso, resultado, interpretación, comunicación o cancelación |
| `POST /storage/clinical/revisiones/:id/adjuntos` | PDF o imagen original de hasta 10 MiB |
| `POST /storage/clinical/revisiones/:id/reportes/:type` | PDF de historia de consulta, receta o indicaciones desde revisión cerrada |
| `GET /storage/clinical/:id/content` | Descarga privada con validación de hash y alcance clínico |

Las escrituras coordinadas usan `Idempotency-Key`; las modificaciones de revisión, consentimiento, llegada u orden comprueban `If-Match`. El servidor vuelve a verificar los permisos de cada detalle involucrado. La lectura de mascota no concede automáticamente acceso a su historia.

PDF e imágenes se validan mediante parser/decodificación; esto no equivale a un antivirus. Las imágenes diagnósticas conservan los bytes originales. Los PDF emitidos conservan snapshot, fuentes versionadas, hash y archivo privado. `pdf-lib` y `@pdf-lib/fontkit` permiten generar PDF con Noto Sans, cuya licencia OFL se conserva en `assets/fonts`. No se calculan dosis ni se generan interpretaciones clínicas.

### Migraciones de esta entrega

Se añaden cinco migraciones, sin editar las históricas:

| Migración | Cambio |
|---|---|
| `1794316000000-clinical-exam` | Examen físico narrativo |
| `1794317000000-clinical-detail-version` | Cambios de detalles incrementan la versión de su revisión |
| `1794318000000-clinical-consent` | Consentimiento clínico y rechazo documentado, conservando peluquería |
| `1794319000000-appointment-scheduling` | Llegada y exclusión de reservas solapadas por responsable |
| `1794320000000-laboratory-workflow` | Órdenes, resultados inmutables, eventos, permisos, RLS e historial |

La migración de agenda requiere `btree_gist`. Si existen reservas activas solapadas, falla sin borrar citas; resolver cada conflicto con el personal responsable antes de reintentar. Los intervalos son `[inicio,fin)`: dos citas adyacentes son válidas. Las citas sin responsable no reservan a un profesional.

Ejecutar las migraciones con el trabajo de migración existente, antes de iniciar la nueva API; no usar `synchronize`. La API conserva su rol limitado. Respaldar PostgreSQL y objetos MinIO de forma coherente. La reversión destructiva está bloqueada: ante una incidencia, usar una migración correctiva o restaurar un respaldo coherente. Los permisos nuevos `orden_laboratorio.read/create/update` requieren asignación explícita a los roles ordinarios y respetan el alcance de sede.

Esta entrega se verificó en bases efímeras; las migraciones no se aplicaron a la base de trabajo existente y no se realizó un despliegue.

### Pruebas del flujo clínico

Con Node.js 24, PostgreSQL local y MinIO configurado:

```sh
npm run build
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run test:auth
# Vite debe estar escuchando en localhost:5174 y Chromium instalado.
TEST_STORAGE=true TEST_BROWSER=true TEST_FRONTEND_URL=http://localhost:5174 npm run test:crud
```

La suite comprueba transacciones, permisos y sedes, organizaciones ajenas, cursores, conflictos de versión, rechazo de cambios en historias cerradas, correcciones, evidencia de consentimiento, reservas simultáneas, laboratorio y PDF reales. Chromium verifica el flujo integrado, renovación de sesión mientras se escribe, reintento tras perder la respuesta de un guardado confirmado, protección de formularios y presentación móvil. Las cuentas y registros son sintéticos; los fixtures eliminan su base y sus objetos al finalizar. `test:integration` es una suite diferente que utiliza la base configurada con transacciones revertidas; no ejecutarla sobre una base productiva.

### Límites actuales

- Diagnósticos y tratamientos históricos se muestran con su fecha; falta un ciclo explícito de problemas activos/resueltos y de suspensión de tratamientos. No se deduce actividad del registro más reciente.
- Se generan documentos de una consulta; quedan pendientes la exportación longitudinal completa y formatos específicos de certificados.
- Guardado explícito, sin recuperación offline ni autoguardado. Los cambios sin guardar permanecen en memoria mientras la sesión sigue vigente.
- La agenda evita solapes, pero no gestiona turnos laborales, vacaciones o recurrencias. Los recordatorios se programan; no hay envío externo conectado.
- Consentimiento documental con evidencia escaneada; no se presenta como firma electrónica certificada ni se afirma validación legal del formato.
- Hospitalización, anestesia, administración/dispensación de medicamentos, inventario y caja no tienen un circuito especializado en esta entrega.
- La auditoría de dependencias de producción del backend mantiene tres avisos moderados transitivos; cero altos o críticos en la comprobación de esta entrega. No se forzaron cambios incompatibles de TypeORM.


## Archivo automático del documento del editor en MinIO

El guardado de `documento` en una revisión clínica ahora archiva su JSON validado y con formato en MinIO. Cubre **Guardar atención e historia**, el alta/edición de revisión, el guardado coordinado y la corrección vinculada. Se normalizan estilos que produce el navegador al pegar contenido: colores RGB, estilos vacíos, nombres de fuentes entre comillas y tamaños compatibles en píxeles. Permanecen las restricciones de estructura, tamaño, atributos y contenido activo.

La migración adicional `1794321000000-clinical-document-archive` crea `vet.documento_clinico_version`. La relación explícita contiene `organizacion_id`, `mascota_id`, `atencion_id`, `revision_id`, `archivo_id`, versión de revisión, fecha y autor. Las claves foráneas compuestas impiden vincular un archivo histórico a otro paciente o atención. El paciente se determina en servidor desde la atención; no se toma de los atributos del editor.

Los objetos usan la ruta `{organizacion}/clinical/pacientes/{mascota}/revisiones/{revision}/{archivo}.json`. Cada cambio documental genera un objeto y un registro inmutables; no se sobrescribe la versión anterior. Guardar contenido sin cambios no duplica el archivo. La versión S3, SHA-256 y tamaño se registran en `archivo`. PostgreSQL conserva también el JSON de trabajo para compatibilidad con el editor y los reportes existentes; el mismo contenido normalizado origina ambos registros dentro del caso de uso, sin una segunda vía de edición del archivo.

Se requiere MinIO y permisos `archivo.create/read`, además de los permisos clínicos. Un fallo de almacenamiento devuelve `503` y revierte la escritura clínica. Un objeto subido cuyo commit resulte fallido o incierto puede quedar privado sin vínculo; no se elimina automáticamente. Las notas aún no guardadas permanecen en el formulario para reintentar.

`GET /api/v1/storage/clinical/pacientes/:id/documentos` lista 25 versiones por página, con `after` UUID y filtro opcional `revision_id`. Requiere acceso al paciente, a la revisión/sede y al archivo. La descarga existente `GET /api/v1/storage/clinical/:id/content` verifica estos enlaces, permisos y hash. Se puede abrir el documento en la ficha del paciente y descargar el JSON original. Los PDF emitidos desde revisiones cerradas siguen siendo documentos distintos.

Los documentos previos a esta función se conservan en su revisión. No se reescriben historias cerradas ni se afirma que ya estén archivadas. El siguiente guardado autorizado de un borrador con documento crea su archivo si falta. Recuperación: migración correctiva o respaldo coherente de PostgreSQL y MinIO; la reversión destructiva está bloqueada.

La [especificación 003](../document-management/specs/003-documentos-paciente-minio/spec.md) contiene alcance y aceptación. Verificado con 25 pruebas unitarias, 4 pruebas HTTP de aplicación, compilación/lint y suite integrada de 423 comprobaciones HTTP más Chromium/MinIO reales: pegar formato, guardar/reabrir, descargar el archivo, permisos por sede/organización, hash, versiones, correcciones y rollback ante almacenamiento indisponible.
