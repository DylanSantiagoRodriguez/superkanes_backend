# 007 · Búsqueda de versiones documentales del paciente

Fecha: 2026-11-17 (America/Bogota). Incremento Brownfield solicitado para validar SDD.

## Necesidad y alcance
El personal autorizado necesita localizar una versión archivada de historia clínica
sin recorrer todas las páginas. Se conserva la ficha del paciente y su listado actual.
El código es el UUID existente de `documento_clinico_version.id`, no el del archivo,
paciente ni revisión. La UI lo denomina «Identificador del documento».

## Requisitos medibles
- R1: buscar por UUID completo o fragmento literal contiguo, sin distinguir mayúsculas.
  Recortar espacios exteriores. Vacío restaura el listado. Fragmentos no vacíos:
  3 a 36 caracteres hexadecimales o guiones; otros valores devuelven 400.
- R2: filtrar todos los documentos accesibles del paciente en servidor, antes del
  límite de 25; conservar cursor y filtro opcional de revisión. Mostrar identificador,
  revisión, versión, fecha y estado; conservar abrir y descargar.
- R3: conservar autenticación y permisos mascota.read, revision_clinica.read y
  archivo.read, aislamiento organizacional y de sede, y auditoría LIST.
  Sin sesión: 401; sin permisos: 403; paciente ajeno: 404; sede no autorizada: sin filas.
- R4: no cambiar registros, edición, cierre, correcciones, descarga ni esquema de datos.
  Consulta sin filtro produce el comportamiento previo.
- R5: formulario accesible con Buscar y Limpiar; carga, vacío y error/reintento.
  Al cambiar filtro o contexto, reiniciar páginas y selección; respuestas antiguas,
  incluso de Cargar más, no deben mezclarse con la búsqueda nueva.

## Aceptación
A1: copiar ID visible y buscarlo devuelve esa versión; fragmento en mayúsculas también.
A2: sin coincidencias muestra mensaje; Limpiar restaura primera página y permite abrir/descargar.
A3: documento fuera de la primera página aparece al buscarlo; Cargar más mantiene filtro.
A4: entradas inválidas se rechazan; sin autorización nunca aparecen documentos ajenos.
A5: crear/editar documento, archivar versión y reabrir sigue funcionando; no se alteran
historias cerradas ni objetos previos. Búsqueda no añade archivos o versiones.
A6: cambiar búsqueda durante una petición pendiente no incorpora resultados anteriores.

## Non-goals
Búsqueda global, búsqueda por contenido clínico o nombre, OCR, nuevos códigos de negocio,
filtros avanzados, exportación longitudinal, migraciones, refactorización de otros módulos.

## Aclaraciones resueltas contra el código
El legado no tiene código/asunto/tipo de documento del ejemplo académico: tiene UUID,
revisión y versión JSON. Usar esos datos existentes evita inventar un contrato de negocio.
No se modifica el CSV de Jira: es inventario histórico, no backlog nuevo aprobado.
La búsqueda se aplica al pulsar Buscar; no hace peticiones por cada tecla.
