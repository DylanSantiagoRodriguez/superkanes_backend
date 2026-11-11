SUPERKANES EN EC2

compose.ec2.yaml es independiente del compose local. Publica únicamente Caddy
(80/443) y una entrada de diagnóstico en 127.0.0.1:5173. PostgreSQL, API y MinIO
no publican puertos. Los datos y certificados usan volúmenes persistentes.

REQUISITOS
Linux amd64, Docker y Docker Compose v2. El host APP_DOMAIN debe resolver a la IP
pública y el grupo de seguridad debe permitir TCP 80 y 443. Caddy obtiene y
renueva el certificado automáticamente. No sustituir HTTPS por cookies inseguras.
La configuración incluye límites de memoria y rotación de logs para instancias
pequeñas. Usar swap y vigilar memoria/disco; ampliar recursos conforme crezca el uso.

CONSTRUCCIÓN Y ENVÍO
Compilar backend y frontend con Node 24. Para el frontend usar VITE_API_URL=/api/v1.
Enviar solo dist, assets y package*.json del backend; dist y nginx.conf del frontend.
Los Dockerfiles backend.Dockerfile y frontend.Dockerfile de este directorio crean
imágenes de ejecución a partir de esos contextos. Instalan las dependencias nativas
en Linux; nunca copiar node_modules de macOS.

MinIO y mc se construyen desde las versiones fijadas en docker/*.Dockerfile.
Estos Dockerfiles admiten docker build --platform linux/amd64 y compilación Go
cruzada nativa. Alternativamente, construir sus binarios estáticos Linux amd64
(GOOS=linux GOARCH=amd64 CGO_ENABLED=0) y usar los Dockerfiles *-runtime.Dockerfile.
Enviar también compose.ec2.yaml, deploy/ec2/Caddyfile, docker/postgres-init.sh,
docker/minio-init.sh y scripts/provision-local-admin.cjs y read-secret.cjs.
No enviar archivos .env locales, llaves, datos clínicos ni credenciales Git.

CONFIGURACIÓN
Copiar environment.example a .env.production fuera de Git. Generar contraseñas
independientes, AUTH_JWT_SECRET de 64 bytes aleatorios codificados en base64,
y asignar imágenes versionadas a BACKEND_IMAGE y FRONTEND_IMAGE.
Permisos del archivo: chmod 600 .env.production.

Desde el directorio remoto del despliegue:
  sudo docker compose --env-file .env.production -f compose.ec2.yaml config -q
  sudo docker compose --env-file .env.production -f compose.ec2.yaml up -d --no-build

La secuencia aplica migraciones antes de la API y prepara el bucket privado,
versionado y con credenciales de aplicación limitadas a sus objetos.
Los servicios persistentes reinician con Docker al reiniciar el servidor.

CUENTA INICIAL (UNA SOLA VEZ)
Usar la contraseña fuerte por stdin, sin escribirla en argumentos o logs:
  sudo docker compose --env-file .env.production -f compose.ec2.yaml run --rm -T bootstrap --email admin@superkanes.local --organization Superkanes --name Administrador --platform-admin --password-stdin --apply
No ejecutar el seed de desarrollo en producción. Configurar sede, especies y
profesionales desde los recursos de la aplicación. No se migran pacientes locales.

VERIFICACIÓN
  sudo docker compose --env-file .env.production -f compose.ec2.yaml ps -a
  curl --fail http://127.0.0.1:5173/api/v1/health/ready
  curl --fail https://DOMINIO/api/v1/health/ready
Verificar inicio de sesión, renovación de cookie Secure, permisos y archivos privados.

ACTUALIZACIONES
Respaldar PostgreSQL y los archivos antes de nuevas migraciones. Conservar el tag de
las imágenes anteriores. Cambiar solo los tags preparados y ejecutar up -d --no-build.
No usar down -v: elimina volúmenes persistentes. Algunas migraciones clínicas son
irreversibles; volver a una imagen anterior no revierte el esquema ni los datos.

REFERENCIAS
https://docs.docker.com/engine/install/ubuntu/
https://caddyserver.com/docs/automatic-https

Si se utiliza un hostname basado en IP (sslip.io), cambiar APP_DOMAIN y recrear
backend/Caddy cuando cambie la IP pública. Un dominio propio con IP elástica evita
que la dirección cambie al detener e iniciar la instancia.

DOMINIO PROPIO Y TRANSICIÓN
Para incorporar un dominio sin interrumpir la dirección anterior, conservar
APP_DOMAIN y añadir los nombres nuevos a APP_DOMAIN_ALIASES separados por espacios.
APP_CORS_ORIGINS debe incluir explícitamente todos los orígenes HTTPS permitidos,
separados por comas. Sin esas variables se conserva el comportamiento de un dominio.
Ejemplo de alias: superkanes.lat www.superkanes.lat.
En el proveedor DNS, configurar el registro A del dominio raíz a la IP pública
actual del EC2 y www como CNAME del dominio raíz. Sustituir solo los registros
web incompatibles de esos nombres; conservar registros de correo y verificaciones.
Todos los nombres deben resolver al servidor para que Caddy emita sus certificados.
Validar Compose y Caddy antes de activar; recrear backend y Caddy tras cambiar sus
variables, y recargar nginx del frontend si cambia la IP interna del backend.
Conservar copias privadas de la configuración anterior para revertir si es necesario.
Verificar la URL previa durante la transición y cada URL nueva tras propagar DNS.
La instancia actual no tiene IP elástica: si cambia su IP pública, actualizar el A.
