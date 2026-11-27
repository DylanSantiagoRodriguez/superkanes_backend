# Validación reproducible del incremento 007

Node 24. Clones backend/frontend hermanos, dependencias instaladas, PostgreSQL y
MinIO locales configurados con variables privadas. Desde backend:

```sh
bash scripts/verify-sdd.sh
```

Desde frontend: `npx playwright install chromium` y
`npm run dev -- --host localhost --port 5174 --strictPort`. Desde backend:

```sh
SDD_INTEGRATION=true bash scripts/verify-sdd.sh
```

La suite CRUD crea/elimina una base efímera y usa archivos sintéticos; búsqueda y UI
se ejecutan desde clinical-document-archive.integration.cjs. test:auth usa su fixture.
No compartir `.env` ni apuntar estos comandos a producción.

Validación manual con una cuenta de prueba autorizada:
1. Abrir Mascotas y tutores → paciente → Documentos del editor.
2. Copiar el identificador visible; buscarlo completo y por fragmento en mayúsculas.
3. Verificar revisión, versión, fecha y estado; abrir el documento y descargar JSON.
4. Buscar un UUID inexistente y comprobar el mensaje sin resultados. Limpiar.
5. Con más de 25 coincidencias, cargar más conservando filtro; cambiar búsqueda durante carga.
6. Comprobar rechazo de caracteres inválidos y error/reintento ante fallo temporal.
7. Guardar una revisión borrador y reabrir; comprobar que el documento previo se conserva.
8. Repetir con una cuenta sin permisos y otra sede: no debe revelar documentos ajenos.

Pruebas automáticas disponibles: permisos/aislamiento, 28 fixtures de paginación,
archivo real en MinIO, download, error/reintento y petición tardía. Las filas de
paginación son metadatos sintéticos; las pruebas de bytes usan archivos reales separados.
