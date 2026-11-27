# Plan de implementación

Constitución 2.1.0: conservar arquitectura, datos y permisos; cambio aditivo y acotado.

1. Proteger documentación en Git raíz y crear feature/sdd-busqueda-documentos en los
   tres repositorios. Añadir integración oficial Codex/skills/bash sin reescribir plantillas.
2. API: añadir query opcional `codigo` al DTO existente, normalizar y validar; SQL
   parametrizado `d.id::text ILIKE %fragmento%` junto a los scopes existentes.
   No cambia respuesta ni cursor, no hay migraciones ni dependencias.
3. React: parámetro opcional al final de patientDocuments para compatibilidad;
   formulario explícito, identificador visible y paginación con el mismo filtro.
   Cancelar peticiones antiguas y reiniciar selección/cursor al cambiar contexto.
4. Tests: extender integración de archivo real con exacto/parcial/invalidación/permisos,
   paginación y regresión; navegador para Buscar/Limpiar/abrir y respuestas tardías.
5. Ejecutar build/lint/Jest/e2e y CRUD con PostgreSQL/MinIO/Chromium locales.
   Revisar diff contra R1–R5 y registrar evidencia, limitaciones y tareas abiertas.

## Contratos intactos
GET sin codigo, response {data,page:{limit:25,next}}, after UUID, revision_id UUID,
headers de autenticación/organización; POST/PATCH/descarga, If-Match, idempotencia,
SQL histórico, objetos MinIO y versiones cerradas. Rollback: revertir commits de código;
no requiere rollback de datos. Desplegar backend antes de frontend (parámetro nuevo).

## Revisión
No existe requisito ambiguo de unicidad o estados: se reutiliza el ID único existente.
Criterios académicos de asunto/tipo no corresponden a este dominio y quedan excluidos.

## Ajuste de destino autorizado
Publicar los artefactos comunes en backend, junto con el incremento, por elección
expresa del usuario. Conservar los repositorios separados y un enlace local
`document-management -> superkanes_backend` para referencias anteriores.
