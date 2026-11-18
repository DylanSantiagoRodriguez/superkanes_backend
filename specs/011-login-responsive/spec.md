# Login adaptable

Conservar colores, card lateral translúcida, tema y autenticación. Reducir espacios e ilustración según altura disponible. En móviles priorizar marca y formulario.

Aceptación: login inicial sin scroll vertical en escritorio 1280×720, 1366×768 y 1440×900 y móvil 375×667/390×844; sin desbordamiento horizontal desde 320px. En alturas menores, zoom o avisos extensos permitir scroll natural para acceder a todos los controles, sin recortar ni bloquear el contenido. Campos, recuperación, tema y envío siguen disponibles.

Implementación: solo CSS del login, medidas fluidas y breakpoint móvil; sin cambios de API o dependencias. Validar build, lint, temas y dimensiones en navegador.
