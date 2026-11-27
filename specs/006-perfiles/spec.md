# Perfiles de tutores y mascotas

Detalle de mascota/tutor abre página completa conservando estado de lista, acciones, permisos y navegación contextual. Tutor: datos, teléfonos, tarjetas de mascotas con vínculos actuales/históricos, alta vinculada y acceso al perfil. Mascota: foto, datos completos, edición, historial cronológico que incluye todas las citas y estados, controles y atenciones, documentos y acciones existentes.

Pesajes manuales desde perfil: fecha/hora, kg positivo, sede y cita opcional del mismo paciente/sede, notas. Persistencia independiente de una revisión para recepción y controles, sin inventar historias clínicas. Tabla aislada por organización con FK compuestas, auditoría e inmutabilidad. Permisos de medición y alcance de sede existentes; creación idempotente. Gráfica lateral mezcla pesajes manuales y mediciones clínicas de la revisión vigente, muestra fechas y comparación con el anterior, estados vacío/único y carga de anteriores. El registro se captura manualmente cada visita, no al abrir una pantalla.

Verificar API (datos, permisos, aislamiento, idempotencia, validación, paginación), Chromium (navegación tutor/mascota, foto/edición, historial/citas, peso/gráfica, móvil) y regresión clínica. Antes de migración local generar respaldo privado y aplicar solamente la migración nueva; reconstruir backend/frontend. Commits con identidad Git configurada.

## Resultado de validación

- Backend: compilación, lint y 26 pruebas unitarias aprobadas.
- Integración en base temporal: 495 comprobaciones HTTP, almacenamiento MinIO y flujos Chromium aprobados, incluidos permisos por sede, aislamiento, idempotencia, citas canceladas, edición, navegación y pesaje con gráfica en móvil.
- Frontend: compilación y lint aprobados; revisión visual de perfiles y diseño adaptable.
- Base local respaldada en archivo privado fuera del repositorio antes de aplicar exclusivamente PatientWeights1794322000000. Backend y frontend reconstruidos y levantados en Docker.
- Verificación local sin escrituras: inicio de sesión, perfil del tutor, tarjetas, perfil de mascota, formulario de peso y navegación de regreso; sin errores JavaScript. API ready: OK.
