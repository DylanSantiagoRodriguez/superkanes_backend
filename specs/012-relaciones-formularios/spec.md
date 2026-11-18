# Mascota y tutor coherentes en formularios

Todos los formularios que consumen una pareja mascota/tutor deben filtrar en ambos sentidos por vínculos vigentes. Incluye historia clínica (tutor_presente_id), agenda y peluquería (tutor_contacto_id). Sin vínculos: lista vacía, nunca todos. Cambiar una selección elimina una pareja incompatible. Validar también en API. Tutor presente continúa opcional. Conservar ediciones históricas sin cambios de la pareja.

Excepción de dominio: el mantenimiento mascota_tutor crea el vínculo y debe permitir seleccionar un tutor nuevo; no exigir que ya exista el vínculo que se está creando. Formularios con solo tutor y sin mascota no tienen pareja que filtrar.

Reutilizar RelationPicker y búsqueda linked_to con permisos existentes. No alterar base de datos ni desplegar.
