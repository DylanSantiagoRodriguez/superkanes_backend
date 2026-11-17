# Fotos de pacientes y documentos clínicos

Solicitud autorizada: 3 de noviembre de 2026. Integrar MinIO en Docker, fotos de pacientes con su nombre y edición extensa de historias clínicas.

## Análisis y decisiones

El backend NestJS/TypeORM ya dispone de `archivo`, su estado de disponibilidad y la relación `mascota.foto_archivo_id`, pero no tenía un proceso de subida. El frontend mostraba formularios genéricos y referencias de archivos. Se reutilizan esos contratos y permisos para que las fotos pertenezcan a la ficha del paciente sin crear otra tabla de mascotas.

Las revisiones clínicas ya tienen control de versión, auditoría y cierre inmutable. El nuevo documento se añade como JSON nullable a esa misma revisión: PostgreSQL conserva la fuente de verdad clínica y MinIO almacena fotos, evitando una transacción distribuida para cada edición de texto. Se usa Tiptap con un esquema limitado y validación en backend. Los datos clínicos anteriores no se convierten ni se reemplazan automáticamente.

Compose incorpora volúmenes persistentes y un migrador separado. Para el workspace existente se reutiliza su volumen PostgreSQL como externo, con respaldo previo y el contenedor anterior detenido. MinIO y mc se compilan desde tags oficiales fijados porque las imágenes públicas verificadas no pudieron descargarse.

## Alcance

- MinIO privado compatible con S3, volumen persistente, credenciales externas y usuario de aplicación limitado al bucket. Compose incorpora PostgreSQL, migrador independiente, API y frontend; también permite ejecutar solo MinIO para desarrollo local.
- Subida autenticada de fotos JPEG/PNG/WebP (máximo 10 MiB), decodificación y normalización de imagen, hash SHA-256 y metadatos en `archivo`. Se usa la relación existente `mascota.foto_archivo_id`; la ficha conserva nombre, especie, raza, sexo y demás datos. Una foto principal por paciente; reemplazarla no elimina evidencia previa.
- Permisos `archivo.create/read` y permisos existentes de mascota. Organización comprobada en cada operación. Bucket sin acceso anónimo; entrega de contenido mediante API autenticada. Altas de archivo idempotentes; vinculación de fotos respeta If-Match.
- Nuevo campo JSON `revision_clinica.documento` para documentos con párrafos, títulos, formato, listas y alineación. Hasta 200.000 caracteres de texto / 1 MiB de JSON. Editor visual amplio, plantilla inicial opcional, contadores, vista de lectura y guardado explícito. No se promete colaboración en tiempo real ni autoguardado.
- Campos clínicos anteriores conservados; revisión cerrada inmutable y correcciones mediante revisión nueva. Validar estructura de documento en servidor; prohibir HTML, imágenes incrustadas y enlaces ejecutables. Evitar pérdida accidental al cerrar con cambios.

## Contratos

POST `/api/v1/storage/photos`, multipart `file`, `Idempotency-Key`, JWT y X-Organization-Id. Devuelve `{data: archivo}`. GET `/api/v1/storage/:id/content`, JWT y organización; entrega bytes verificados con cache privado desactivado. La API nunca acepta claves S3 del navegador.

El CRUD existente de revisiones admite `documento` nullable. Migración aditiva, sin modificación de migraciones anteriores. Recuperación mediante restauración de respaldo o migración correctiva; no borrar documentos en un downgrade automático.

## Aceptación y verificación

Crear paciente, subir foto, guardar, recargar y ver foto junto a su nombre; reemplazarla con control de versión. Reintentos de subida no duplican archivo. Rechazar contenido falso, exceso de tamaño, otras organizaciones y falta de permisos. Crear/editar/reabrir documento extenso conservando formato, rechazar documentos malformados y mantener cierre/concurrencia existentes. Compilación y lint de ambos proyectos, pruebas unitarias e integración real de PostgreSQL/MinIO cuando estén disponibles.

## Evidencia de implementación

- Backend: compilación y lint; 18 pruebas unitarias.
- HTTP con PostgreSQL temporal y MinIO real: 308 comprobaciones, incluidos documentos extensos, aislamiento, versiones, cierre clínico, carga/lectura privada de fotos, contenido falso, tamaño e idempotencia.
- Autenticación: 48 comprobaciones, incluida renovación, revocación y cookies.
- PostgreSQL: contexto transaccional, RLS y rollback reales.
- Chromium: foto de paciente con nombre, advertencia de descarte, edición de documento extenso, guardado y reapertura. La sesión de prueba se inyecta; las operaciones de recursos usan API/BD reales.
- Límite operativo: guardado explícito, una foto principal por ficha, sin colaboración simultánea ni recolección automática de objetos huérfanos. MinIO comunitario archivado; despliegue configurado para desarrollo local.

## Corrección del flujo de atenciones (3 de noviembre de 2026)

El formulario principal de nueva atención debe incluir motivo de consulta y editor de documento sin exigir navegar a revisiones. `POST resources/atencion_clinica/con-historia` guarda atención y primera revisión borrador en una misma transacción, con los permisos de ambos recursos y una única clave idempotente. Un fallo revierte ambos registros. Se conserva el CRUD anterior para integraciones existentes.

`GET resources/atencion_clinica/autor` devuelve el profesional vinculado al usuario autenticado dentro de la organización (o null); el alta visual lo selecciona automáticamente, explicando cuándo falta ese perfil. No se relaja la regla de autoría ni se asignan nuevos permisos. El detalle de atención permite consultar y editar sus revisiones, conservando versiones y cierres. Pruebas: alta atómica, rollback, reintentos, autor ajeno, permisos y flujo de navegador desde Atenciones clínicas.

Verificación de la corrección: compilación y lint de ambos proyectos, 18 pruebas unitarias y 319 comprobaciones HTTP aprobadas. Chromium verificó la creación desde Atenciones clínicas, profesional automático, documento y primera revisión persistidos; la comprobación final en Docker usó la cuenta local existente sin crear registros clínicos adicionales.

## Corrección de especie y raza al registrar mascotas

Se reprodujo HTTP 404 al seleccionar una raza perteneciente a otra especie: el formulario cargaba todas las razas, aunque la relación de PostgreSQL exige organización, especie y raza compatibles. Filtrar opciones mediante `filter.especie_id`, conservar ese filtro en la paginación, limpiar la raza cuando se cambia la especie y descartar respuestas tardías. Raza permanece opcional. El backend devuelve un código de validación explícito si la raza existe dentro de la organización pero pertenece a otra especie; IDs inexistentes o de otra organización conservan el comportamiento no revelador. El cliente traduce únicamente códigos conocidos, sin mostrar mensajes internos arbitrarios. Verificar altas con/sin raza, edición, cambio rápido de especie, paginación, tutor y foto mediante API/Chromium en base temporal.

Verificación de registro de mascotas: 326 comprobaciones HTTP aprobadas y prueba Chromium de alta con tutor, filtrado de razas, segunda página, cambio rápido de especie y edición sin raza. El servidor rechaza combinaciones incompatibles con código explícito y conserva el aislamiento de IDs de otras organizaciones. Las pruebas se ejecutaron en una base temporal eliminada al finalizar.

## Presentación profesional del editor

Solicitud: aspecto similar a un procesador de texto Word. Sustituir la fila de botones por cabecera, cinta de herramientas agrupadas (fuente, párrafo, estilos, edición), iconos accesibles, hoja blanca con márgenes y barra inferior de recuento/zoom. Añadir tipografía, tamaño, color, resaltado e interlineado con valores acotados y persistencia JSON validada en backend. Mantener documentos anteriores, títulos/listas, bloqueo de lectura y guardado explícito de la ficha. Sin prometer exportación DOCX ni paginación de impresión. Comprobar persistencia/reapertura de formatos, rechazo de estilos arbitrarios, vista móvil y escritorio.

Verificación: compilación y lint de ambos proyectos, 19 pruebas unitarias y 326 comprobaciones HTTP aprobadas. Chromium comprobó guardado y reapertura de fuente, tamaño, color, resaltado e interlineado, además del zoom en lectura. Inspección visual en escritorio (1440 px) y móvil (390 px), sin crear registros en la base de uso habitual.
