# Documentos del editor asociados al paciente en MinIO

## Problema y alcance

El guardado de atención/historia rechaza documentos producidos por pegado de texto con formato: Tiptap serializa colores rgb y atributos de estilo vacíos. Corregir la compatibilidad del contrato sin admitir HTML activo, URLs, atributos arbitrarios ni tamaños ilimitados.

Al guardar contenido del editor, almacenar una versión inmutable de su JSON con formato en MinIO privado. PostgreSQL conserva el documento de trabajo para compatibilidad con el editor y los PDF existentes, más metadatos/versiones y una relación explícita por organizacion_id, mascota_id, atencion_id, revision_id y archivo_id. Ambas representaciones se originan en el mismo contenido validado durante la escritura; no existe un segundo editor del archivo. Un fallo de MinIO impide confirmar la transacción clínica. Un objeto subido cuyo commit falla puede quedar privado y huérfano; no se elimina automáticamente ante un commit incierto.

## Contrato

- Reutilizar archivo y StorageService, sin otra configuración S3 ni credenciales nuevas.
- Clave de objeto: organizacion/clinical/pacientes/mascota/revisiones/revision/uuid.json. La identidad del paciente se resuelve en servidor a partir de la atención; nunca se toma de campos libres del documento.
- Nueva tabla documento_clinico_version con enlaces compuestos de organización, paciente, atención, revisión y archivo; versión de revisión, hash mediante archivo, fecha y autor. Solo insertar/leer, con RLS, auditoría y protección contra modificación.
- Cubrir creación de atención con historia, creación/actualización genérica de revisión, guardado coordinado y corrección vinculada. Cambiar el contenido crea versión; cambios sin modificación documental no duplican objetos. Borrar contenido de un borrador conserva las versiones archivadas anteriores.
- Sin documento no se necesita MinIO. Con documento se requiere almacenamiento disponible y permisos archivo.create/read además de los permisos clínicos originales.
- Listado paginado por paciente y filtro de revisión; requiere mascota.read, revision_clinica.read y archivo.read con alcance de sede. Descarga privada revalida vínculo y permisos; el UUID del archivo no concede acceso.
- Las revisiones existentes conservan su contenido; no se alteran historias cerradas ni se anuncia que ya están archivadas. Un siguiente guardado autorizado de un borrador con documento genera su archivo si aún falta.
- La UI distingue versiones del editor (JSON con formato) de PDF emitidos de la consulta. Los PDF existentes siguen disponibles al cerrar una revisión.

## Aceptación

1. Pegar formato real del navegador, guardar y reabrir sin error 400, conservando texto y formato compatible.
2. El objeto existe en MinIO, su hash coincide y su relación apunta al paciente/atención/revisión correctos.
3. Actualizar crea otra versión sin sobreescribir la anterior; reintentar la misma alta no duplica objetos.
4. Consultar y descargar desde la ficha; rechazar organización/sede ajenas, permisos insuficientes y mutaciones del archivo histórico.
5. Un fallo de almacenamiento revierte alta/edición y conserva las notas en pantalla; revisión cerrada sigue siendo inmutable.
6. Compilación, lint, pruebas unitarias de normalización, integración HTTP/PostgreSQL/MinIO efímera y navegador.
7. Reconstruir el entorno local para mostrar el cambio, con respaldo previo a migraciones. Commits con la identidad Git configurada del usuario.


## Resultado verificado

- Reproducción en Chromium: pegar un párrafo con `rgb(36,91,166)` y `backgroundColor` vacío provocaba rechazo de validación. Se normaliza a color hexadecimal y atributo nulo; los atributos arbitrarios/CSS activo siguen rechazados.
- Persistencia: nueva tabla inmutable, relaciones compuestas, claves por paciente/revisión, SHA-256 y versión de objeto. Se conserva el JSON transaccional para compatibilidad; cada archivo se origina del mismo contenido validado.
- Permisos: acceso clínico por sede y archivo por organización, con pruebas de sede ajena que conservan permiso de archivo y aun así reciben rechazo de descarga. Sin exposición de URL S3 pública.
- UI: versiones del editor en ficha y consulta; lectura del objeto en MinIO y descarga original. Sin recargar automáticamente pestañas que podrían tener notas pendientes.
- Pruebas: 25 unitarias, 4 de aplicación, 423 comprobaciones HTTP del fixture, pruebas adicionales de MinIO y Chromium; build/lint de ambos proyectos. Se comprueba rollback de alta y modificación ante fallo simulado de almacenamiento, preservación de objetos anteriores, normalización de formato, hash, idempotencia y corrección de revisión cerrada.
- Límite deliberado: el archivo editable es JSON de Tiptap con formato; no es DOCX. Los PDF de consulta existentes mantienen su proceso de emisión. No se reescriben historias cerradas anteriores para rellenar archivos retroactivamente.

## Aplicación local

Se reconstruyeron backend/frontend con Node 24, se aplicó la migración mediante el servicio migrate existente y se verificó la API a través de Nginx en 127.0.0.1:5173: readiness, acceso de la cuenta local y consulta autorizada de documentos por paciente responden correctamente. Se tomó respaldo privado de PostgreSQL antes de aplicar el cambio. No se alteraron documentos clínicos existentes para demostrar el flujo; las escrituras de prueba se realizaron en bases temporales y objetos propios del fixture.
