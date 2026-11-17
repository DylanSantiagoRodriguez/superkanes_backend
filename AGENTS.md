# Superkanes: trabajo Brownfield con Codex

Leer `superkanes_backend/.specify/memory/constitution.md` (desde la raíz del workspace),
o `.specify/memory/constitution.md` desde backend, antes de cambiar código.
El workspace coordina dos repositorios Git independientes: `superkanes_backend`
y `superkanes_frontend`. La documentación y herramientas SDD se versionan en backend. El Git raíz solo conserva
el baseline anterior y enlaces de compatibilidad; no necesita remoto.
Comprobar ambos estados y, si existe, el Git raíz; nunca añadirle los repositorios hijos.

Las skills oficiales de Spec Kit están en `.agents/skills` dentro del backend.
El workspace puede enlazarlas desde su raíz. Ejecutar sus scripts desde
`superkanes_backend`, donde está `.specify`; no reinicializar la aplicación.
En Codex usar `$speckit-constitution`, `$speckit-specify`, `$speckit-clarify`,
`$speckit-plan`, `$speckit-checklist`, `$speckit-tasks`, `$speckit-analyze`,
`$speckit-implement`, `$speckit-converge`. Son instrucciones de chat, no comandos shell.
Si la sesión no descubre skills nuevas, abrir otra sesión desde este workspace;
también puede leerse directamente el SKILL.md correspondiente.

Especificar solo el incremento en `superkanes_backend/specs/NNN-nombre/`.
Actualizar requisitos antes de cambiar alcance. Separar hechos, decisiones e hipótesis.
Preservar contratos, RLS, permisos por sede, archivos privados, Idempotency-Key,
If-Match e historias cerradas. No añadir arquitectura ni dependencias sin necesidad.
Usar Node 24. Comandos y requisitos de pruebas en README de ambos proyectos.
Pruebas de BD y almacenamiento solo con fixtures sintéticos y servicios locales;
no ejecutar migraciones ni semillas sobre producción. No imprimir `.env` ni secretos.
Registrar comandos, resultados y limitaciones en `evidence.md`; convergencia no
sustituye tests ni revisión humana. No marcar tareas pendientes como terminadas.
