# Evidencia — 2026-11-17

Editor compartido detecta el campo por referencia a tutor, en vez de exigir tutor_contacto_id. Cobertura de parejas del catálogo: cita, servicio_peluqueria y atencion_clinica. mascota_tutor conserva creación de vínculos. Otros recursos sin pareja no se filtran arbitrariamente. El flujo de consentimiento ya tiene validación de tutor autorizado (regresión aprobada).

API añade tutor_presente_id a la comprobación de vínculo vigente, mantiene campo opcional y no bloquea ediciones históricas sin cambio de pareja.

Node24:
- Frontend build y lint aprobados (advertencia existente de tamaño de bundle).
- Backend build y 26 pruebas unitarias aprobados.
- TEST_RELATION_BROWSER=true node test/crud.integration.cjs: 547 comprobaciones HTTP aprobadas; base temporal eliminada.
- Nuevas comprobaciones: atención genérica y con historia rechazan tutor ajeno; creación con tutor vinculado válida; cambio a ajeno rechazado; quitar tutor opcional válido.
- Chromium real contra API de prueba: historia clínica filtra mascota desde tutor y tutor desde mascota; agenda, alta contextual y peluquería sin regresiones.

No se desplegó. Cambios de frontend disponibles en Vite 5174; la nueva validación API se probó en proceso aislado, no se sustituyó el contenedor local ni producción.

## Activación local y reproducción del reporte

Reproducido en localhost:5173: Nala DEMO mostraba Lucía, Ana y Carlos. El contenedor servía la versión anterior, mientras Vite5174 tenía el cambio. Reconstruidos backend/frontend y recreados con `docker compose up -d --no-deps backend frontend`; sin migraciones ni cambios en producción.

Playwright con login real sobre5173 y base local: tras seleccionar Nala DEMO en Nueva atención e historia clínica, tutor_presente_id contiene únicamente Lucía DEMO. Aserción exacta de una opción aprobada; formulario cancelado sin guardar registros. La validación API nueva también está activa en contenedor local.
