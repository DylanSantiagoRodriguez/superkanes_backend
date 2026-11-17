# Refactor visual azul de SUPERKANES

## Alcance e invariantes

Aplicar la identidad de las tres propuestas de design/mockups/azul al frontend completo. Centralizar colores, superficies, tipografía, radios, sombras y estados. Mantener las mismas rutas, contratos, datos, permisos, validaciones, etiquetas de acciones, eventos, guardado, documentos, navegación y componentes funcionales. No añadir botones simulados, métricas ficticias, búsquedas o funciones presentes solo en los mockups. Los colores de los documentos clínicos redactados por el usuario se conservan; el tema solo afecta al marco/editor y a los controles.

## Diseño

Azul primario #2563eb, azul profundo #123b72, tinta #172b4d, superficies blancas, fondo #f7f9fc, selección azul hielo. Ámbar y rojo se conservan para avisos y errores con etiquetas explícitas. Tipografía de sistema, iconos SVG consistentes y decorativos, navegación clara, tablas y formularios con densidad cómoda. Login, resumen, agenda, pacientes, consulta, laboratorio, consentimientos, adjuntos, reportes, configuración y diálogos comparten los mismos tokens. Sin dependencias adicionales ni imágenes generadas en ejecución.

## Verificación

- Build y lint de frontend.
- Regresión existente con Chromium/API/PostgreSQL/MinIO efímeros: alta de paciente, edición, documento con formato, archivo en MinIO, SOAP, cierre/corrección, consentimiento, laboratorio y protección de notas.
- Revisión visual de login, resumen, listas, ficha, consulta y diálogos; revisar navegación por teclado, foco visible, controles deshabilitados, estados y anchuras móvil/tableta/escritorio sin desbordamiento global.
- Comprobar diff para que los cambios TypeScript sean exclusivamente presentación; no modificar modelos de datos, handlers o reglas del backend.
- Reconstruir solo frontend local después de verificar, conservando datos y sesiones. Commits con identidad Git configurada del usuario.

## Resultado

Tema compartido en src/theme.css; todos los módulos consumen los mismos colores. Navegación y tarjetas con SVG decorativos, controles y diálogos coherentes, fichas y documentos con superficies comunes. Se retiró App.css, sin importaciones, para evitar reintroducir estilos verdes globales. Favicon y color del navegador azules. No se modificaron endpoints, modelos, permisos ni eventos de negocio.

Validación: compilación y lint correctos; regresión real con 423 comprobaciones HTTP y tres recorridos Chromium, incluyendo MinIO. Se corrigió un selector ambiguo de la prueba (dos pacientes sintéticos con igual nombre), usando su código único. Revisión del frontend Docker en ocho módulos, ficha, consulta y diálogos a 1440, 820 y 390 px: sin desbordamiento global ni errores de JavaScript; foco visible. La compilación conserva el aviso existente sobre el tamaño del paquete JavaScript. Las capturas de la instancia local se mantienen fuera del repositorio, en /tmp.
