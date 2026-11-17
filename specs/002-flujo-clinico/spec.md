# Evolución clínica integrada

Solicitud: prompt maestro de evolución integral de SUPERKANES, 10 de noviembre de 2026.

## Auditoría y reutilización

| Funcionalidad | Estado inicial | Componentes existentes | Acción |
|---|---|---|---|
| Identidad, organizaciones y permisos | Implementada | Auth, ResourceAccess, RLS | Reutilizar; probar aislamiento y sede |
| Pacientes y tutores | Implementada | Mascota, vínculos con vigencia, foto | Añadir ficha clínica contextual |
| Resumen clínico | Faltante en UI | Alertas, mediciones, revisiones | Lecturas autorizadas y paginadas |
| Consulta | Parcial | Atención con revisión transaccional, editor | Integrar SOAP y detalles sin duplicar entidades |
| Historia longitudinal | Parcial | Vista historial_mascota | Consumir con permisos por cada origen, filtros y paginación |
| Corrección | Parcial | Revisiones previas y triggers inmutables | Acción guiada y preservación del original |
| Adjuntos | Parcial | Archivo y adjunto_clinico; carga solo de fotos | Extender carga y descarga autorizadas |
| Documentos emitidos | Parcial | Tabla inmutable reporte_emitido | Generación desde información persistida |
| Consentimiento clínico | Faltante | Consentimiento exclusivamente de peluquería | Ampliación compatible, evidencia y versión |
| Seguimiento | Parcial | Cita y recordatorio | Programación desde paciente; no simular entrega |
| Laboratorio | Faltante | Catálogo de laboratorios | Definir órdenes y resultados vinculados |
| Hospitalización y cirugía | Pendiente de alcance comercial | Sin flujo especializado | Decisión de negocio requerida |
| Caja e inventario | Pendiente de reglas de negocio | Sin circuito económico | No activar operaciones económicas ni proveedores |

## Contrato incremental: ficha y consulta

- Reutilizar mascota/atencion_clinica/revision_clinica. No crear HistoriaClinica duplicada.
- Cada lectura verifica usuario, membresía, organización y permiso por recurso/sede. Un permiso sobre mascota no concede lectura clínica.
- Las secciones sin permiso se distinguen de listas vacías. No inferir ausencia de alergias a partir de datos no disponibles.
- Consultas y mediciones históricas conservan fecha y revisión de origen. No etiquetar diagnósticos o prescripciones como activos sin un estado clínico explícito.
- La ficha tiene cabecera, alertas, resumen, consultas, mediciones, diagnósticos, prescripciones, vacunas, documentos y controles.
- API agregada bajo /resources/clinica. Paginación acotada, orden estable, parámetros validados. No consultas por cada fila ni filtrado de seguridad en cliente.
- Datos SOAP: anamnesis/evaluacion/plan son narrativos; mediciones, diagnósticos y prescripciones son estructurados y no se sincronizan mediante extracción automática de texto. El documento previo se conserva.
- Guardado y cierre comprueban versiones y autoría. Altas coordinadas usan Idempotency-Key. Las operaciones dependientes se realizan en una transacción.
- No se modifican migraciones históricas. Nuevas capacidades persistentes requieren migración adicional.
- Estados existentes: atención abierta/cerrada/anulada; revisión borrador/cerrada. Una corrección es una revisión vinculada, no una reapertura silenciosa.
- No se calculan dosis ni se generan recomendaciones terapéuticas.

## Aceptación y verificación

1. Abrir un paciente, ver antecedentes autorizados e iniciar atención con paciente precargado.
2. Ver más registros mediante paginación sin confundir un subconjunto con el historial completo.
3. Rechazar organización ajena, membresía inactiva, permisos insuficientes y sede ajena; auditar lecturas.
4. Registrar consulta y detalles, cerrar y recuperar datos sin perder el documento anterior.
5. Corregir preservando versión original; rechazar conflictos concurrentes.
6. Error de red mantiene el formulario; reintentos no duplican altas.
7. Compilación y lint de ambos proyectos; integración HTTP/PostgreSQL en base efímera; aceptación Chromium con datos sintéticos.

## Entorno y entrega

No alterar datos productivos ni secretos. Pruebas contra base temporal identificada, eliminada por su propio fixture. Commits con identidad Git configurada del usuario y sin atribución adicional. No push ni despliegue productivo implícitos.

## Consulta coordinada y documentos

- POST /resources/clinica/revisiones/:id/guardar: notas SOAP y hasta 100 operaciones de detalle. If-Match e Idempotency-Key obligatorios. Autor autenticado de la atención. Error en cualquier detalle revierte todo.
- POST /resources/clinica/revisiones/:id/corregir: motivo obligatorio, copia autorizada de los detalles y notas a una revisión vinculada. No altera el original ni reabre la atención cerrada.
- Examen físico se almacena en una columna adicional de revisión. Una migración nueva incrementa la versión de revisión al modificar detalles, incluso desde el CRUD existente.
- Cierre coordinado requiere motivo, evaluación y plan; el profesional puede expresar lo no aplicable. Datos de dosis permanecen bajo decisión del profesional.
- Unidades para peso, temperatura, frecuencias, llenado capilar y condición corporal; ninguna recomendación terapéutica automática.
- Las notas no se almacenan en localStorage. La navegación con cambios pendientes se bloquea y los reintentos conservan clave de idempotencia. Guardado explícito, sin prometer recuperación de texto aún no enviado tras cerrar el navegador.
- Adjuntos: PDF no cifrado ni activo e imágenes JPEG/PNG/WebP decodificables, hasta 10 MB. Imágenes diagnósticas preservan bytes originales y resolución; no utilizar normalización de fotos para informes clínicos. PDF validado por parser, sin afirmar análisis antivirus.
- Dependencia justificada: pdf-lib 1.17.1 para validación estructural de PDF y generación de documentos persistidos. No hay motor PDF en las dependencias existentes.
- Emisión: solo desde revisiones cerradas, con snapshot de identificación y fuentes versionadas, hash y archivo privado; tipos historia de consulta, receta e indicaciones. No generar certificados con afirmaciones clínicas automáticas.
- Almacenamiento por organización y autorización de revisión/sede para subida y descarga. No exponer rutas públicas de documentos.

## Consentimiento clínico

Extender consentimiento existente con atencion_id como alternativa excluyente a servicio_id; conservar contratos y datos de peluquería. Procedimiento y alcance se fijan al emitir el documento. Firma registrada mediante evidencia documental adjunta al mismo paciente/atención, con decisión explícita de aceptación o rechazo, identidad del tutor tomada por servidor y fecha del servidor. No presentar el escaneo como firma electrónica certificada. Las autorizaciones limitadas se describen en el alcance/documento emitido; cambios requieren otro consentimiento. Se conserva aceptación/rechazo y revocación. Comprobar tutor autorizado y vigente, plantilla activa/publicada, hash, permisos y sede. Un consentimiento clínico no representa autorización para tratamiento de datos personales.

## Agenda y seguimiento

Agenda diaria filtrada por fechas, con alcance de sede; llegada registrada desde servidor; iniciar consulta desde cita reutiliza sede, paciente y tutor. Inicio y cierre coordinan estados de cita en la misma transacción y exigen cita.update. Reservas activas del mismo responsable no pueden solaparse; intervalos [inicio,fin), citas sin responsable no reservan un profesional. La migración se revierte por completo si hay conflictos previos, sin borrar citas. Recordatorios se pueden programar/cancelar; ningún estado equivale a entrega real y no se activa proveedor externo sin configuración. Hospitalización/cirugía y finanzas se mantienen fuera de la consulta ambulatoria hasta contar con reglas comerciales; el alcance clínico actual admite documentación y consentimiento de procedimientos.

## Laboratorio ambulatorio

Órdenes vinculadas a atención, catálogo de laboratorio existente y profesional responsable. Estados: solicitada → muestra_tomada → en_proceso → resultado_disponible → revisada → comunicada; cancelación antes del resultado. Registro explícito de muestra, resultado e interpretación profesional. Resultados publicados son inmutables: correcciones anexan otra versión con motivo y vuelven a exigir revisión. Comunicación registrada significa que un usuario documentó el contacto, no que el sistema envió un mensaje. Permisos independientes orden_laboratorio.read/create/update, con alcance heredado de la atención y sede. La API mantiene versiones, idempotencia, RLS y auditoría. No se generan valores de referencia ni interpretaciones automáticas.


## Estado de la entrega — 10 de noviembre de 2026

La entrega integra el circuito ambulatorio sobre las entidades existentes. El criterio de recorrido se verifica con datos sintéticos, API, PostgreSQL y MinIO reales: paciente → antecedentes → consulta SOAP → medición → solicitud de exámenes → consentimiento → cierre → PDF → corrección. Los contratos de diagnósticos, prescripciones, control y cita tienen pruebas HTTP. No equivale a certificar operación productiva o cumplimiento legal.

| Fase | Estado | Funcionalidades | Pruebas | Observaciones |
|---|---|---|---|---|
| 0. Auditoría | Verificada | Matriz inicial, arquitectura, contratos, permisos y fuentes existentes | Inspección de código y regresión del CRUD | Se conservan React, NestJS, TypeORM y PostgreSQL |
| 1. Ficha integral | En desarrollo | Cabecera, tutor, alertas, peso, antecedentes, secciones y acciones contextuales verificadas | HTTP, sedes, organización ajena, Chromium | Falta ciclo explícito de problemas activos/resueltos y tratamientos suspendidos; se muestran históricos sin inferir actividad |
| 2. Consulta integrada | Verificada | Motivo, SOAP, examen físico, mediciones, diagnósticos, prescripción y guardado coordinado | Rollback, unidades, autoría, idempotencia, Chromium | Examen por sistemas disponible como narrativa/secciones existentes, sin cálculos terapéuticos |
| 3. Historia longitudinal | Verificada | Cronología autorizada, búsqueda, fechas, tipos, paginación, apertura de consulta y peso observado | Cursores, permisos por fuente y filtros HTTP | Gráfica de peso; no se interpola ni se afirma seguimiento especializado de enfermedad crónica |
| 4. Borrador/cierre/corrección | Verificada | Guardado explícito, cierre confirmado, original protegido, copia vinculada y comparación | Concurrencia, detalle modificado, rollback, pérdida de respuesta, renovación de sesión y navegación | Sin recuperación offline ni autoguardado |
| 5. Documentos | En desarrollo | Adjuntos privados y PDF de consulta, receta e indicaciones verificados | MIME real, parser, hash, imagen original, acceso, PDF y Docker | Falta exportación longitudinal completa, certificados y formatos específicos de seguimiento |
| 6. Consentimientos | Verificada | Procedimiento, límites, aceptación/rechazo, tutor y evidencia, compatibilidad con peluquería | HTTP, fecha/autor, tutor no autorizado, idempotencia y sede; Chromium | Registro documental; la validación jurídica del formato y firma queda pendiente |
| 7. Operación clínica | En desarrollo | Agenda, llegada, reserva sin solapes, inicio/cierre de cita, recordatorios programados y circuito de laboratorio verificados | Reservas simultáneas, aislamiento, versiones de resultado, estados y Chromium | Pendientes turnos laborales, recurrencias y proveedor de entrega; seguimiento posterior se programa como control |
| Hospitalización/cirugía | Pendiente | Consentimiento y documentación general disponibles | Sin circuito especializado implementado | Separar ingreso/egreso, monitoreo, administración y anestesia de la consulta ambulatoria |
| Administración | Pendiente | Catálogos y prescripción reutilizables | Sin movimientos económicos implementados | Inventario, dispensación, facturación y caja requieren reglas y configuración de integración; prescribir no descuenta existencias ni genera cobros |

### Evidencia técnica

- Backend: compilación y lint; 7 suites unitarias con 23 pruebas; 4 pruebas HTTP de aplicación; 48 comprobaciones de autenticación.
- Integración: 412 comprobaciones HTTP en una base temporal con 47 recursos consultados y 44 tipos de altas; pruebas adicionales de reserva simultánea y navegador. Se verifican RLS, permisos de sede, autoría, auditoría, versiones, rollback e idempotencia.
- Chromium: registro de mascotas/razas, foto, documento con formato y flujo de ficha/consulta. Renovación real del token de acceso mediante el callback de sesión con notas pendientes; pérdida de la respuesta posterior al commit y reintento; bloqueo de navegación con laboratorio pendiente; cierre/PDF/corrección y ancho de 390 px.
- MinIO: documentos y fotos sintéticos, bytes y hash, descarga privada, tipos no válidos y reintentos. La limpieza elimina solo los objetos/versiones pertenecientes al fixture.
- Imagen `superkanes-clinical-review:local`: build con Node 24; ejecución como usuario sin privilegios; generación/lectura de PDF Unicode con la fuente empaquetada y comprobación de Argon2. No se desplegó ni sustituyó el stack existente.
- Frontend: TypeScript, build Vite y lint. Persiste aviso de paquete principal de aproximadamente 731 kB minificado; pendiente dividir la carga del editor.
- Dependencias: actualización compatible del lockfile del backend; quedan 3 avisos moderados transitivos de producción y ninguno alto/crítico en esta comprobación. No se forzaron cambios incompatibles del ORM.

### Correcciones encontradas durante la verificación

El cursor del historial conserva microsegundos para no saltarse registros. Los detalles incrementan la versión de su revisión, evitando cierres con información desactualizada. Las correcciones de laboratorio conservan interpretación y comunicación anteriores mediante eventos inmutables. La renovación de sesión no sobrescribe notas en edición. La ficha actualiza el último peso al guardar una medición; el formulario conserva segundos y milisegundos de medida_en para no ordenar una observación nueva antes de otra registrada en el mismo minuto. La navegación protege formularios de laboratorio; sus controles mantienen etiquetas accesibles estables después de escribir. Las reservas concurrentes dependen de una exclusión de PostgreSQL y muestran un error comprensible. Las pruebas de navegador esperan sus rutas pendientes antes de cerrar para garantizar la limpieza del fixture.

### Ubicación y operación

- Backend: `src/clinical/` contiene agregación, agenda y laboratorio; `src/resources/resource-persistence.service.ts` coordina guardado/corrección/consentimiento; `src/storage/clinical-*` implementa archivos y PDF. Contratos y migraciones detallados en el README del backend.
- Frontend: `src/features/clinical/` contiene ficha, consulta, laboratorio, consentimientos, documentos, agenda y evolución de peso. Reutiliza componentes de `workspace` y `shared`.
- Migraciones nuevas: `1794316000000` a `1794320000000`. No se han aplicado a la base de trabajo existente. La migración de agenda falla de forma atómica ante solapes previos; no borra citas. Recuperación mediante migración correctiva o respaldo coherente de base y archivos.
- Commits locales en cada repositorio con la identidad Git ya configurada del propietario; sin coautoría adicional ni push. Esta especificación está en la carpeta documental existente, que no tiene repositorio Git propio.

### Prioridad de continuación

1. Problemas clínicos activos/resueltos y estado explícito del tratamiento, con eventos que no alteren una revisión cerrada.
2. Exportación longitudinal paginada y formatos de seguimiento sustentados en datos persistidos.
3. Turnos/ausencias del profesional y entrega de recordatorios con estados reales del proveedor, consentimiento de contacto y reintentos.
4. Prueba de restauración de PostgreSQL/MinIO, revisión legal de formatos y validación operativa por el personal antes de usar datos reales.
5. Hospitalización/cirugía e inventario/dispensación/caja como módulos separados con contratos propios. No interpretar una receta como administración ni un registro clínico como movimiento financiero.
