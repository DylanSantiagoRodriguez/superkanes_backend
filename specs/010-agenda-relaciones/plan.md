# Plan
Añadir linked_to validado a listQuery de mascota/tutor y EXISTS sobre mascota_tutor
con permisos y organización. Validar par en ResourceRulesService.
Pasar contexto al RelationPicker desde RecordEditor, conservando búsquedas cancelables.
Reutilizar RecordEditor para reserva reducida en Agenda con valores derivados y campos
visibles acotados. Conservar contrato cita; servicio elegido en notas.

Reserva sin duración: nullable fin solo en cita peluqueria; conservar control de
solapamientos para citas con fin definido, calendario incluye reservas puntuales.
Actualizar DTO, entidad y contrato. Down rechaza datos con fin nulo para no inventar
ni perder horarios. El formulario reducido deriva tipo/notas y omite fin.

Ingreso: POST /resources/clinica/citas/:id/ingreso-peluqueria con cuerpo vacío,
Idempotency-Key e If-Match. Verifica cita.update y servicio_peluqueria.create en la
sede. Bloqueo de cita y clave idempotente; crea servicio programado y lo transiciona
a recibido en la misma transacción que actualiza llegada. Hora UTC del servidor
y fecha de ingreso según zona de la sede. La reserva mantiene su fecha prevista.
Responsable y teléfono admiten null durante recepción; constraint y validación los
requieren en servicio/finalizado/entregado. No se inventan datos ni firmas.
Consentimiento vacío en modal antes de guardar y confirmación pendiente después;
la restricción existente de consentimiento firmado permanece para iniciar servicio.
