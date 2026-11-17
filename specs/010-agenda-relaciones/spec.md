# 010 · Relaciones tutor/mascota y agenda de estética

## Hechos y alcance
RelationPicker busca todas las mascotas/tutores; cita sugiere solo el tutor principal.
La cita ya admite tipo peluqueria, inicio y fin; servicio_peluqueria representa la
atención operativa y requiere responsable y datos adicionales. La reserva de agenda
se realiza como cita. El ingreso posterior crea el servicio operativo recibido;
responsable y teléfono se completan antes de iniciar el servicio.

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
día/hora y sede después de seleccionar el servicio. Guardar como cita peluqueria,
identificar el servicio en notas y permitir fin nulo únicamente para este tipo.
No calcular una duración ficticia: el usuario confirmó que los tiempos reales se
registran después en Peluquería. Se requiere una migración aditiva para admitir
reservas sin fin; las citas clínicas y vacunales conservan su fin obligatorio.
R5: acción de ingreso con hora del servidor al guardar, precedida de un paso de
consentimiento vacío y explícitamente pendiente de plantilla. No crear texto,
firma ni aceptación ficticios. Decisión confirmada por el usuario: permitir guardar la recepción con consentimiento
pendiente; no autoriza iniciar el servicio. Inicio/fin/recogida reales se
administran en Peluquería; conservar exigencia de consentimiento firmado antes del servicio.
R4: conservar agenda clínica, permisos, controles de concurrencia e idempotencia,
altas contextuales y apariencia. Sin despliegue ni cambios de datos productivos.

## Verificación
Build/lint, pruebas PostgreSQL de filtros/paginación/aislamiento y combinación inválida;
pruebas de navegador en ambos órdenes, limpieza de selección y reservas reducidas.

El ingreso crea el servicio operativo vinculado a la cita en una transacción, en
estado recibido y con llegada_en del servidor. Responsable y teléfono pueden quedar
pendientes hasta editar en Peluquería; se exigen antes de comenzar el servicio.
No se asignan responsables ficticios ni se inventa un teléfono. Consentimiento
permanece sin documento ni firma. Reintentos no duplican ni cambian la hora original.

## Corrección de recorridos reportados
El formulario corto debe activarse también al elegir tipo Peluquería dentro de
Programar cita y al crear desde el apartado Peluquería. Desde Peluquería se reserva
con los mismos cuatro campos y luego se abre consentimiento/ingreso; si se cancela
ese paso, la reserva permanece en Agenda y no se crea una recepción incompleta.
Validar filtrado de tutores con mascota seleccionada en estos recorridos. El usuario
indica expresamente NO desplegar.
