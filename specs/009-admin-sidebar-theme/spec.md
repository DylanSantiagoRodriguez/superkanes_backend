# 009 · Acceso global del admin y controles compactos
Fecha: 2026-11-17. Pedido: admin accede a todas las organizaciones, sidebar contraíble,
modo claro/oscuro mediante un único botón.

## Alcance y decisiones
Admin significa el administrador de plataforma existente (`platformAdmin`), no cualquier
rol llamado Administrador ni una cuenta identificada por nombre/correo. Se incluyen todas
las organizaciones activas sin crear membresías; las inactivas siguen bloqueadas.
Los usuarios ordinarios conservan solo sus membresías activas y permisos existentes.

## Requisitos y aceptación
R1: /auth/me conserva su contrato y lista todas las organizaciones activas al admin
incluyendo las que no tienen membresía suya. La API permite operar en ellas con el
contexto de organización existente. Un usuario ordinario no ve ni accede a organizaciones ajenas.
R2: sidebar expandida inicialmente; botón accesible para contraer/expandir. En escritorio
quedan iconos con nombre accesible y tooltip; se puede abrir el selector de organización
desde el estado compacto. En móvil se oculta el menú hasta expandirlo. Recordar únicamente
la preferencia visual, no IDs clínicos ni credenciales. No perder página o cambios de formulario.
R3: sustituir el selector de Apariencia por un botón sol/luna con nombre que indique
la acción siguiente. Alternar claro/oscuro y conservar elección tras recarga; una preferencia
previa Sistema o inexistente sigue el sistema hasta el primer clic. Manejar storage bloqueado.
R4: conservar turquesa, login de vidrio, autorización, sesiones, contratos y datos.

## Fuera de alcance
Dar privilegios de plataforma a usuarios existentes, acceder a organizaciones inactivas,
crear membresías automáticas, migraciones y refactorizaciones.

## Verificación
Pruebas de auth HTTP con JWT y PostgreSQL efímero: admin sin membresía, organización
inactiva, >25 organizaciones, usuario ordinario, rol administrador local, revocación
de privilegio y acceso efectivo a recurso. Build/lint de ambos, unitarias/e2e y navegador
para sidebar, tema, móvil, organización y conservación de datos del formulario.

## Ajuste visual solicitado
R5 (revisado por el usuario): restaurar el fondo claro anterior de la sidebar
(#f2f6fd) y sus colores de texto originales. Mantener R1–R4: admin global,
sidebar contraíble, botón de tema y modo oscuro. Desplegar solo esta reversión visual.
Sin cambios de contratos, permisos ni datos.

Despliegue autorizado por el usuario: publicar R1–R5 sobre las versiones productivas,
conservar imágenes anteriores y verificar salud HTTP y UI publicada.
