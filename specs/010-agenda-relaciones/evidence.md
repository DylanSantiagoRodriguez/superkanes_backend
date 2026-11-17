# Evidencia parcial · 010 · 2026-11-17

R1/R2 implementados; R3 pendiente de aclarar duración de baño/peluquería con el usuario.
No se desplegó este incremento. Node 24.

- Backend build/lint correctos tras corregir formato y permitir linked_to en DTO.
- 26 pruebas unitarias y 4 e2e correctas.
- `TEST_RELATION_BROWSER=true TEST_FRONTEND_URL=http://localhost:5174 node test/crud.integration.cjs`: 523 comprobaciones HTTP correctas con PostgreSQL efímero eliminado al finalizar.
- Cubre filtros en ambos sentidos, paginación >25, vínculo finalizado excluido, organización ajena sin resultados, parámetro inválido, cita/peluquería con par inválido y actualización de contacto inválida.
- Chromium conectado a API local real: tutor primero limita mascotas, mascota limita tutores; búsqueda, alta contextual mascota/tutor, selección sugerida validada, cancelación, reintento idempotente y móvil correctos. El fixture selecciona expresamente Prueba A para no depender del orden de organizaciones del admin global.
- Frontend build/lint correctos; persiste aviso conocido de bundle >500 kB.

Limitación observada: la suite completa con TEST_BROWSER=true se detuvo en pet-browser porque su fixture elige implícitamente la primera organización (Clínica creada por API) y busca especies de Prueba A. No es fallo del flujo de relaciones; se ejecutó la prueba de navegador específica del incremento mediante TEST_RELATION_BROWSER y se conserva la limitación explícita.
