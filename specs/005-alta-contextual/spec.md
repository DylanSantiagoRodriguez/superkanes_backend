# Selección y alta contextual de mascotas y tutores

Permitir buscar por texto en las relaciones mascota/tutor de todos los formularios. Búsqueda paginada en API, conservando permisos, organización y filtros. Mascotas por nombre, código y microchip; tutores por nombre, apellido, documento y correo. Conservar opción seleccionada al buscar/paginar, cancelar peticiones obsoletas y permitir reintento.

Crear mascota desde el selector y crear tutor dentro del alta de mascota. Reutilizar RecordEditor y sus validaciones, protección de cambios, idempotencia y creación atómica mascota/vínculo existente. Diálogos nativos apilados sin formularios anidados ni IDs duplicados. Selección automática al guardar; mantener los valores del formulario original. Mostrar creación solo con permiso. Los registros confirmados se conservan aunque se cancele el formulario principal.

Verificar búsqueda fuera de primera página, términos especiales y paginación, aislamiento/permisos; navegador cita -> mascota -> tutor -> regreso -> cita guardada, cancelación sin pérdida de datos, nombres repetidos, búsqueda rápida y móvil. Ejecutar regresión clínica existente; desplegar servicios locales afectados sin migración. Commits con identidad Git del usuario.

## Resultado

Implementado RelationPicker para todas las relaciones mascota/tutor de RecordEditor. Conserva selector nativo accesible y añade búsqueda paginada en el servidor, nombres con código/documento para desambiguar, carga adicional, reintento y conservación de selección. Altas anidadas con identificadores propios, protección de cambios e información de persistencia. Al crear una mascota se aprovecha la transacción existente que crea su vínculo principal; en citas se propone ese tutor como contacto sin sobrescribir una elección manual.

Verificación: build/lint de ambos proyectos, 26 pruebas unitarias y regresión de 467 comprobaciones HTTP con PostgreSQL/MinIO efímeros. Chromium verifica las historias existentes y el nuevo recorrido cita → mascota → tutor, búsqueda fuera de primera página, cancelación con Escape sin cerrar al padre, conservación de la cita, móvil, ausencia de IDs duplicados y reintento después de perder la respuesta de creación del tutor sin duplicarlo. No hay cambios de esquema ni migraciones.
