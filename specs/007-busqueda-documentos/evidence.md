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
## Verificación de las ramas publicadas

Ramas `review/sdd-busqueda-documentos`, creadas desde origin/main; solo contienen
el incremento y documentación. El código probado corresponde a backend `7afe394`
y frontend `be4f3b8`; los commits posteriores solo cierran documentación/evidencia.
Los commits locales anteriores 8718c6e/377a1b8 permanecen fuera de estos PR.

- `SDD_INTEGRATION=true TEST_FRONTEND_URL=http://localhost:5175 bash scripts/verify-sdd.sh`:
  prerequisitos, build/lint, 26 unitarias, 4 e2e y 48 auth aprobados. Las nuevas pruebas
  documentales y de navegador también pasaron. Una primera ejecución se interrumpió
  al finalizar la prueba previa profiles-browser.cjs: `Route is already handled`.
- Se limpiaron explícitamente la BD y objetos sintéticos del fixture interrumpido,
  identificados mediante el marcador exclusivo de esta prueba; no se tocaron datos operativos.
- Repetición `TEST_STORAGE=true TEST_BROWSER=true TEST_FRONTEND_URL=http://localhost:5175 npm run test:crud`:
  terminó con exit 0, 526 comprobaciones HTTP generales, 25 consultas documentales y
  todas las pruebas Chromium de esa rama aprobadas; base temporal eliminada.
- No se modificó profiles-browser.cjs: la interrupción anterior queda registrada como
  inestabilidad observada del harness, no como fallo reproducido de producto.
- Diez skills Codex comprobadas contra los hashes del manifest oficial instalado.

Publicación en borrador: [backend #1](https://github.com/DylanSantiagoRodriguez/superkanes_backend/pull/1)
y [frontend #2](https://github.com/DylanSantiagoRodriguez/superkanes_frontend/pull/2).
Sin merge, despliegue ni afirmación de aprobación humana.
