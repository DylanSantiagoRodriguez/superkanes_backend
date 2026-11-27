# Evidencia — 2026-11-17

Cambio limitado a LoginPage.module.css: espacios adaptados al alto, ilustración limitada, cabecera móvil compacta, card lateral y temas conservados.

- Node24: npm run build y npm run lint aprobados (advertencia existente de bundle >500kB).
- node test/theme-browser.cjs aprobado: temas, persistencia, formulario, navegación y contraste.
- Chromium/Playwright sobre localhost:5174: sin scroll inicial en 1440×900, 1366×768, 1280×720, 1024×768, 768×1024, 390×844 y 375×667.
- 320×568 y 844×390: scroll vertical natural necesario, sin desbordamiento horizontal. Recuperación y botón de envío accesibles en las nueve dimensiones.
- Capturas revisadas: /tmp/login-responsive.png y /tmp/login-responsive-mobile.png.
- Primer intento de prueba no llegó al formulario por falta de cabeceras CORS en el mock; corregido el mock, matriz completa aprobada.

Solo validación visual con API simulada; sin cambios de autenticación, datos o despliegue. Disponible en Vite local 5174.
