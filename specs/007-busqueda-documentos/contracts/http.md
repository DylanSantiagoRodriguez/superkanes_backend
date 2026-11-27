# Contrato aditivo
GET /api/v1/storage/clinical/pacientes/:id/documentos?codigo=abc&after=UUID&revision_id=UUID

`codigo`: opcional; trim, vacío sin filtro; 3–36 caracteres [0-9a-fA-F-].
Coincidencia literal contigua, insensible a mayúsculas, sobre ID de versión documental.
Parámetros inválidos: 400. JWT requerido: 401 sin sesión. Se mantienen 403/404 y scopes.
Respuesta y orden idénticos: data con campos existentes; page.limit=25; page.next UUID/null.
Aplicar código antes de paginar. El cliente reinicia after cuando cambia el filtro.
