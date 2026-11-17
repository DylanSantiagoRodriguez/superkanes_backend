# Evidencia de verificación · 2026-11-17, America/Bogota

Entorno: macOS arm64, Node 24.22.3 mediante paquete temporal de npm (shell tenía 26).
PostgreSQL/MinIO locales existentes, Chromium instalado para Playwright. Sin despliegue.
No se aplicaron migraciones a la base operativa; fixtures crean y eliminan bases temporales.

## Baseline
- Backend: build y lint aprobados; Jest 7 suites / 26 tests; e2e 1 suite / 4 tests.
- Frontend: build y lint aprobados. Aviso previo de bundle >500 kB.
- Regresión CRUD/MinIO sin navegador: 524 comprobaciones HTTP; base temporal eliminada.
  Se verificó antes de integrar la UI; no se probaron entonces consultas con codigo.

## Implementación en el workspace
- `bash scripts/verify-sdd.sh` con Node 24: prerequisitos SDD, diff, build/lint de ambos,
  26 tests unitarios y 4 e2e aprobados. El script sin SDD_INTEGRATION informa la omisión.
- Backend `npm run test:auth`: 48 comprobaciones aprobadas.
- Backend `TEST_STORAGE=true TEST_BROWSER=true TEST_FRONTEND_URL=http://localhost:5174 npm run test:crud`:
  526 comprobaciones HTTP de la suite general, más 25 consultas verificadas por la suite
  documental nueva. Ambas cifras son contadores distintos; no cuentan cada assert de navegador.
- Chromium nuevo: búsqueda exacta/parcial, abrir, descarga JSON real, 25+3 coincidencias,
  vacío, Limpiar, entrada inválida, 503/reintento y descarte de paginación tardía; móvil sin overflow.
- Chromium regresión: mascotas/razas, editor, calendario, consulta SOAP, cierre/corrección,
  perfiles/pesos, altas contextuales, catálogos y gestión de usuarios.
- Archivo: hash/bytes originales, versiones inmutables, permisos, organización, sede,
  rollback de escritura fallida y corrección conservados. Fixture de paginación separado
  (28 metadatos sintéticos locales, no se afirma que esos archivos se puedan descargar).

## Incidencias detectadas y resueltas
- Lint detectó formato del mensaje del DTO; corregido.
- Se eliminó un reset de estado innecesario en useEffect; filtros reinician mediante key.
- Faltaba Chromium de la versión instalada de Playwright; instalado antes de verificar UI.
- Simulación de 503 de una sola respuesta fallaba con doble efecto de React en desarrollo;
  la prueba mantiene el fallo hasta pulsar Reintentar. No se modificó producto para ocultarlo.
- Conector GitHub devolvió 404; cliente gh local sí dispone de acceso al repositorio.

## Trazabilidad y límites
R1: document-search.integration.cjs (exacto/parcial/normalización/400).
R2: misma suite (25+3, match fuera de página, revisión) y document-search-browser.cjs.
R3: JWT 401, permisos 403, organización 404, sede sin filas en PostgreSQL real.
R4: suite de archivo y regresión CRUD/MinIO/Chromium; no hay migraciones nuevas.
R5: navegador con carga retenida, filtro nuevo y liberación tardía, vacío y 503/reintento.

Quedan revisión humana y despliegue; pruebas automatizadas no acreditan ninguno.
No se realizó benchmark de grandes volúmenes. Se mantiene el aviso previo de bundle.
Los logs crudos locales están en /tmp/superkanes-sdd-*.log; este resumen versionado
registra comandos/resultados sin publicar secretos ni información clínica real.
La verificación de las ramas de PR aisladas se añadirá al finalizar su preparación.
