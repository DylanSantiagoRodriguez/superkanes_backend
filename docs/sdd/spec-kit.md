# Configuración de Spec Kit

La configuración que originalmente vivía en `document-management/` se conserva
ahora en la raíz de backend, por decisión del usuario de publicar SDD en ese remoto.
La guía vigente está en [README.md](README.md).

`.specify` contiene constitución, plantillas, scripts y workflow; `.agents/skills`
contiene Codex, `.github/skills` conserva Copilot y `specs` conserva el historial.
La carpeta local `document-management` es un enlace de compatibilidad, no otra copia.

Los scripts resuelven la raíz por `.specify`. Ejecutarlos desde backend; para código,
`src/` y `test/` son locales, frontend está en `../superkanes_frontend/`. En artefactos
con rutas desde el workspace usar `superkanes_backend/` y `superkanes_frontend/`.
No crear proyectos adicionales `backend/`/`frontend/` ni reinicializar servicios existentes.
