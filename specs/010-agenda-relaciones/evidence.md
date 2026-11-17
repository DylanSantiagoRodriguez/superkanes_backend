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

## Cierre del incremento · reserva e ingreso

El usuario confirmó: no calcular duración; las horas operativas se completan en
Peluquería, y el ingreso se puede guardar con consentimiento pendiente hasta recibir
su plantilla. R3/R5 actualizados. No queda pendiente una decisión para este alcance.

- Build/lint de ambos repositorios con Node24: correctos.
- Backend: 26 pruebas unitarias y 4 e2e correctas.
- `TEST_RELATION_BROWSER=true TEST_FRONTEND_URL=http://localhost:5174 node test/crud.integration.cjs`: **542 comprobaciones HTTP correctas**, 47 recursos consultados y 44 tipos creados. PostgreSQL temporal con todas las migraciones; eliminado al terminar.
- Chromium/API real: reservas de Baño y Peluquería con exactamente cuatro campos nombrados (día y hora se ingresan juntos), fin null, cancelación del modal de consentimiento vacío, guardado pendiente, pérdida de respuesta y reintento sin duplicación ni cambio de hora, navegación al apartado de Peluquería, móvil390 sin desbordamiento ni errores JavaScript.
- API: clínica/vacunación sin fin rechazadas; calendario incluye reservas sin fin; horas del cliente rechazadas en ingreso; misma hora servidor en cita y servicio; servicio recibido sin inicio/finalización/recogida; sin documento ni firma; transición a en_servicio rechazada sin datos operativos y sin consentimiento firmado.
- Permisos: sin permiso403, organización ajena404, creación limitada a otra sede403 sin escritura parcial; recepción permitida en la sede autorizada y atribuida al usuario real. Versiones obsoletas412, doble ingreso409; mismo Idempotency-Key devuelve resultado original.
- Down de la migración rechazado con datos pendientes, dentro de una transacción revertida: no inventa horarios ni elimina registros.
- Inspección visual de `/tmp/superkanes-grooming-agenda.png`.
- La primera ejecución de navegador terminó sus aserciones pero falló al cerrar una petición pendiente. Se corrigió el cierre del fixture esperando networkidle; la repetición completa salió0. La base temporal de aquella ejecución se eliminó explícitamente, conservando otras bases ajenas.
- `git diff --check`: correcto en ambos repositorios.

No desplegado. Requiere aplicar GroomingReservations1794900000000 por el flujo
existente de migraciones antes de ejecutar esta versión; ninguna migración se ejecutó
sobre producción. La plantilla y el circuito de firma futuro quedan fuera del alcance
actual, conforme a la instrucción de dejar el consentimiento vacío y pendiente.
