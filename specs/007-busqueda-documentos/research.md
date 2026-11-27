# Análisis observado antes de modificar la aplicación

- Frontend React 19/TypeScript/Vite, sin router externo; navegación de workspace en memoria.
  `src/features/clinical/PatientDocuments.tsx` lista, pagina, abre JSON y descarga.
  `src/features/workspace/model.ts` centraliza API; `shared/api/http.ts` transporta sesión.
- Backend NestJS 11/TypeORM/PostgreSQL. Controlador `storage/clinical-documents.controller.ts`:
  GET `/api/v1/storage/clinical/pacientes/:id/documentos`, after y revision_id UUID.
  `clinical-document-archive.service.ts` aplica permisos y scopes antes de LIMIT 26,
  devuelve 25 y next. El UUID d.id ordena las páginas; no es orden cronológico.
- Persistencia: `vet.documento_clinico_version` enlaza paciente, atención, revisión y archivo;
  MinIO guarda JSON privado. Servicio de descarga comprueba acceso e integridad.
- Auth: guard global y JWT/sesiones; ResourceAccessService autoriza dentro del contexto
  de organización, con SQL por sede y RLS. No inferir permiso desde un botón visible.
- Pruebas: Jest unitarias y e2e; `test/crud.integration.cjs` crea base efímera, aplica
  migraciones y ejecuta archivo clínico con TEST_STORAGE=true. Playwright se invoca
  desde esa suite con TEST_BROWSER=true; frontend debe escuchar en 5174.
- README backend apunta a README raíz inexistente al inicio; se añadirá guía de coordinación.
- Estado inicial: backend 8718c6e y frontend 377a1b8, limpios, cada uno un commit por delante
  de origin/main. Documentación fuera de Git: respaldada en commit raíz 1a45575.
- Spec Kit 1.2.3.dev0 ya instalado para Copilot/bash. Instalación incremental de Codex
  conserva las 12 rutas de scripts/plantillas existentes; no ejecutar init --force encima.

## Riesgos e hipótesis
- Riesgo de mostrar resultados obsoletos: cancelar cargas y descartar respuestas por contexto.
- Riesgo de bypass de permisos: añadir predicado a la consulta actual, sin vía paralela.
- Buscar fragmentos de UUID usa cast y puede escanear filas: alcance por paciente,
  mínimo 3 caracteres, sin prometer rendimiento no medido ni añadir índices preventivos.
- Docker estaba detenido y Node del shell era 26; verificar con Node 24 y servicios
  locales antes de afirmar resultados de integración. La documentación previa no es evidencia nueva.

## Decisión de publicación
El usuario eligió backend como remoto de SDD. Se trasladó allí la configuración,
las skills y las especificaciones, sin duplicar la fuente canónica. La carpeta
`document-management` del workspace es ahora un enlace al backend; los enlaces
históricos siguen funcionando. El Git raíz conserva el baseline y los enlaces locales.
