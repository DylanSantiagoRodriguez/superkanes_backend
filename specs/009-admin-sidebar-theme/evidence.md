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
