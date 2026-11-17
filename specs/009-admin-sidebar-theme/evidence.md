# Evidencia · 009

Validación local, 2026-11-17, Node 24.

- Backend: `npm run build`, `npm run lint`: correctos.
- `npm test -- --runInBand`: 7 suites, 26 pruebas correctas.
- `npm run test:e2e -- --runInBand`: 4 pruebas correctas.
- `npm run test:auth` y repetición `node test/auth.integration.cjs` tras ampliar el caso de rol local: 56 comprobaciones correctas. Base PostgreSQL efímera eliminada al finalizar. JWT real; 27 organizaciones adicionales sin membresía; inactiva excluida/bloqueada; acceso HTTP a tutor; revocación de privilegio inmediata; usuario con rol Administrador local limitado a su organización incluso enviando cabecera de admin; sin membresías automáticas.
- Frontend: `npm run build`, `npm run lint`: correctos. Vite conserva advertencia de chunk >500 kB.
- `node test/theme-browser.cjs`: correcto. Playwright en localhost:5174; botón de tema sin selector, persistencia, compatibilidad con preferencia sistema, formulario conservado, storage bloqueado, 22 contrastes >=4.5, sidebar de 76 px y persistencia tras recarga, apertura del selector desde barra compacta, cambio de organización con contexto en la petición, menú móvil oculto/expandido, sin desbordamiento ni errores JavaScript.
- Capturas inspeccionadas: escritorio oscuro y móvil; archivos temporales `/tmp/superkanes-workspace-dark.png`, `/tmp/superkanes-workspace-mobile.png`.
- `git diff --check`: correcto en ambos repositorios.

## Convergencia
R1 cubierto por auth y acceso a recursos reales; R2/R3 por navegador; R4 por regresión de autenticación y contraste. No se cambian esquema ni permisos de cuentas. La UI usa fixtures sintéticos: la autorización se demuestra por separado con PostgreSQL/JWT, no por mocks.

Cambios preparados en `feature/009-admin-sidebar-theme` en ambos repositorios. No se desplegaron estos cambios ni se probaron cuentas productivas. Sigue pendiente la revisión humana del incremento.

## Ajuste R5 · sidebar clara turquesa
Se limita el fondo #00b4d8 a AppShell en modo claro y se usa #062e38 para
texto e iconos. Los tokens de superficies clínicas siguen intactos.
Build y lint frontend con Node 24 correctos (misma advertencia de tamaño de chunk).
`node test/theme-browser.cjs` correcto: tema, sidebar, móvil, persistencia y contraste.
Captura móvil revisada visualmente con fondo turquesa, navegación y selector legibles.
`git diff --check` correcto en ambos repositorios. No desplegado.

## Despliegue autorizado completado · 2026-11-17
Publicado en https://superkanes.lat y https://www.superkanes.lat.
Fuentes publicadas en rama `release/009-admin-sidebar-theme` de cada repositorio:
backend d40d53e sobre producción 8718c6e; frontend 9366bee sobre 639b207.
Solo se incorporó este incremento a los baselines productivos.

Imágenes activas:
- backend `superkanes-backend:ec2-admin-d40d53e`, ID 74bbda315d91.
- frontend `superkanes-frontend:ec2-sidebar-9366bee`, ID 7dd7626e5458.

Build/lint de ambas fuentes release aprobados con Node24. Backend: 26 unitarias,
4 e2e y 56 comprobaciones de auth contra PostgreSQL efímero aprobadas. Frontend:
Playwright sobre build release en localhost:5177 aprobado. VITE_API_URL=/api/v1.
Artefacto SHA256: 262f391f0673f8d547ec51e94aee9aa73fe60e563a44f260bffa765390561fc5.

Compose recreó exclusivamente backend/frontend con --no-deps --no-build --wait.
Sin migraciones ni semillas. PostgreSQL, MinIO y Caddy permanecieron activos.
Verificación real sin interceptar API: HTTPS200, readiness200 en ambos dominios,
login visible, botón de tema y persistencia, móvil390 sin desbordamiento, CSS nuevo
y sin errores JS. No se inició sesión con cuentas productivas; permisos y sidebar
autenticada se verificaron antes con pruebas locales. Captura:
/tmp/superkanes-production-009.png.

Respaldo remoto privado: /opt/superkanes/.env.production.before-admin-sidebar-009.
Rollback: restaurar únicamente BACKEND_IMAGE=superkanes-backend:ec2-users-8718c6e
y FRONTEND_IMAGE=superkanes-frontend:ec2-theme-8470ebf en .env.production; ejecutar
`sudo docker compose --env-file .env.production -f compose.ec2.yaml up -d --no-deps --no-build --wait backend frontend`
desde /opt/superkanes. Las imágenes anteriores siguen disponibles; no hay datos que revertir.
