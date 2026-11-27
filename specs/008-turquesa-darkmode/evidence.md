# Evidencia 008 · 2026-11-17

Node 24, frontend en localhost:5174. Cambios locales en feature/008-turquesa-darkmode.
- `npm run build`: aprobado. Se mantiene el aviso previo de bundle >500 kB.
- `npm run lint`: aprobado.
- `node test/theme-browser.cjs`: aprobado con Chromium y respuestas sintéticas de API.
  Verifica Claro/Oscuro/Sistema, persistencia tras recarga, cambios de sistema en vivo,
  elección explícita independiente del sistema, preferencia inválida, almacenamiento
  bloqueado, conservación de formulario, selector autenticado, calendario y móvil 390 px.
- 22 combinaciones de texto/fondo verificadas con contraste >=4.5:1 (11 por modo).
  Se corrigió el placeholder claro heredado que tenía contraste 4.38:1.
- Revisión visual de capturas de acceso claro/oscuro y workspace oscuro.
  Capturas sin animaciones para no confundir colores intermedios de transición con la paleta.
- `git diff --check` sin errores en ambos repositorios.

Capturas locales: /tmp/superkanes-login-light.png, /tmp/superkanes-login-dark.png,
/tmp/superkanes-workspace-dark.png, /tmp/superkanes-workspace-mobile.png.

La prueba es de apariencia y comportamiento de preferencias; no acredita permisos
ni integración backend. No se modificaron contratos, datos clínicos, migraciones ni
el contenido/colores guardados del editor. La hoja documental sigue siendo blanca;
su entorno de edición utiliza el tema elegido. Sin dependencias nuevas ni despliegue.

## Ajuste de tarjeta lateral de vidrio
Build, lint y suite theme-browser aprobados nuevamente. Revisión visual de capturas
de acceso claro/oscuro: tarjeta derecha con margen, radio de 32 px (26 px móvil),
sombra, superficie al 78% y blur de 24 px. Los controles, textos, ilustración y acento
se conservan. El navegador sin backdrop-filter utiliza fondo opaco como respaldo.

## Despliegue autorizado · 2026-11-17 (America/Bogota)

Publicado en https://superkanes.lat y verificada salud también en www.superkanes.lat.
Solo se recreó frontend; backend, PostgreSQL, MinIO y Caddy conservan sus contenedores.
Imagen activa: `superkanes-frontend:ec2-theme-8470ebf` (ID corto 560caa6866d6).
Imagen anterior retenida: `superkanes-frontend:ec2-users-377a1b8`.

Se construyó desde la versión productiva 377a1b8, aplicando únicamente el cambio de
apariencia; no se incluyó la búsqueda documental pendiente de la rama local. Fuente
publicada en frontend `release/008-turquesa-darkmode`: código 8470ebf; 639b207 solo
adapta la prueba de contraste a los colores hexadecimales abreviados del build.
Build con Node 24 y VITE_API_URL=/api/v1, lint y theme-browser sobre el build aprobados.
Artefacto SHA-256: 013af7c2cd2c5148313964cfca47d11174a5502f1f58766c3b6080aa5cbd5c20.

Validaciones reales posteriores: ambos health/ready HTTP 200 (database up), HTML
con assets index-EEFNQiUP.js e index-DBYuA_pl.css, Chromium sin interceptar API:
login visible, acento correcto, blur24, claro/oscuro, recarga persistente y móvil390
sin desbordamiento ni errores JavaScript. No se ingresó a una cuenta ni se escribieron
datos clínicos en producción. Capturas en /tmp/superkanes-production-light.png y dark.png.

Respaldo privado remoto: /opt/superkanes/.env.production.before-theme-8470ebf.
Rollback: conservar cualquier cambio posterior de configuración, restituir únicamente
FRONTEND_IMAGE=superkanes-frontend:ec2-users-377a1b8 en .env.production y ejecutar
`sudo docker compose --env-file .env.production -f compose.ec2.yaml up -d --no-deps --no-build frontend`
desde /opt/superkanes. Verificar HTTPS/health de nuevo; no requiere revertir datos.
