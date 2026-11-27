# Plan 008
Reutilizar theme.css y CSS Modules. Separar color de acento, texto de enlace y texto
sobre acento. Convertir colores fijos de calendario y usuarios a variables semánticas.
Selector reutilizable en LoginPage y AppShell. Inicialización antes del primer pintado,
preferencia local validada y seguimiento de matchMedia. Sin dependencias nuevas.
Comprobar Chromium con API simulada para apariencia (no acreditará integración backend),
contraste de tokens, recarga, sistema, almacenamiento bloqueado y ancho móvil.
Build y lint frontend. No requiere pruebas de BD por no cambiar contratos ni persistencia clínica.

Ajuste posterior de login: modificar únicamente LoginPage.module.css para presentar
la columna de acceso como tarjeta lateral de vidrio. Reutilizar color-mix, variables
existentes, gradientes y backdrop-filter; fallback opaco mediante @supports. Mantener
JSX y lógica de acceso. Apilar bajo 720 px, conservar margen exterior y campos legibles.
