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

## Corrección de recorridos · sin despliegue
Se conectó Nuevo registro/Nuevo baño del apartado Peluquería al formulario corto
y luego al paso de consentimiento e ingreso existente. Cambiar Tipo a Peluquería
en Programar cita también reduce el formulario sin perder mascota/tutor/sede.
Las ediciones operativas existentes mantienen sus campos de seguimiento.

Build y lint frontend correctos. La suite con TEST_RELATION_BROWSER=true repitió
542 comprobaciones HTTP y los navegadores con API real. Nuevas aserciones reproducen
las capturas: seleccionar mascota en Programar cita solo ofrece sus tutores; cambiar
tipo a peluquería deja cuatro campos; Nuevo registro desde Peluquería permite guardar
la reserva y el ingreso pendiente. Captura inspeccionada: /tmp/superkanes-grooming-four-fields.png.

Se verificó solo por lectura que la web pública sigue usando index-7hH0eA29.js
y Docker local localhost:5173 index-C23qP2uE.js, ambos anteriores al incremento.
El usuario indicó expresamente no desplegar: no se actualizaron contenedores ni
producción ni se ejecutaron migraciones sobre datos de trabajo. Navegadores de prueba
en localhost:5174 se conectaron a API/base efímeras mediante el fixture.

## Activación del entorno local para revisión
Se actualizó el Docker local que sirve localhost:5173, después de respaldar la base
local en /tmp/superkanes-local-backup/before-010.dump (archivo privado). Se construyeron
backend, migrate y frontend, se ejecutaron migraciones locales y se recrearon solo
backend/frontend. No se accedió ni modificó producción en esta activación.
Chromium sin mocks, autenticado contra localhost:5173: login correcto, Nuevo registro
 en Peluquería muestra cuatro campos, Programar cita cambia a cuatro campos al elegir
Peluquería, y las opciones de tutor corresponden al resultado filtrado por la mascota
seleccionada en la base local. Se cerraron formularios sin guardar datos de negocio.
Se conservaron credenciales y datos locales. Esta activación reemplaza la limitación
anterior de Docker local desactualizado; no constituye un despliegue productivo.
