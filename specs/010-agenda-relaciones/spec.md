# 010 · Relaciones tutor/mascota y agenda de estética

## Hechos y alcance
RelationPicker busca todas las mascotas/tutores; cita sugiere solo el tutor principal.
La cita ya admite tipo peluqueria, inicio y fin; servicio_peluqueria representa la
atención operativa y requiere responsable y datos adicionales. La reserva de agenda
se realiza como cita, sin crear una atención operativa incompleta.

R1: en formularios con mascota_id y tutor_contacto_id, elegir mascota filtra tutores
vinculados y elegir tutor filtra mascotas vinculadas. Vínculos vigentes según la
convención existente: vigente_hasta IS NULL. Búsqueda y paginación conservan el filtro.
Al cambiar una selección, conservar la otra solo si sigue vinculada; sin vínculo,
mostrar lista vacía, sin ofrecer todos como alternativa. No filtrar el editor de
mascota_tutor usado para crear vínculos ni el tutor principal de mascotas nuevas.
R2: backend aplica filtros por organización y permisos y rechaza una combinación
sin vínculo al crear o cambiar mascota/contacto en cita o servicio_peluqueria.
Ediciones ajenas a esos campos conservan la compatibilidad con datos históricos.
R3: Agenda ofrece reservar Peluquería o Baño solicitando únicamente tutor, mascota,
día/hora y sede después de seleccionar el servicio. Guardar como cita peluqueria;
identificar el servicio en notas, sin migraciones ni contratos rotos. Duración pendiente
de respuesta del usuario; no implementar esa decisión hasta recibirla.
R4: conservar agenda clínica, permisos, controles de concurrencia e idempotencia,
altas contextuales y apariencia. Sin despliegue ni cambios de datos productivos.

## Verificación
Build/lint, pruebas PostgreSQL de filtros/paginación/aislamiento y combinación inválida;
pruebas de navegador en ambos órdenes, limpieza de selección y reservas reducidas.
