# SUPERKANES · SDD Brownfield para Codex

Superkanes ya utiliza React 19, NestJS 11, PostgreSQL y MinIO. Este flujo define y
verifica incrementos pequeños sobre la aplicación existente; no reconstruye el sistema
ni convierte el inventario Jira entregado en nuevas funcionalidades.

## Fuente canónica y repositorios

Por elección del equipo, **backend versiona toda la documentación SDD común**:

- [Constitución](../../.specify/memory/constitution.md)
- [Instrucciones para Codex](../../AGENTS.md) y [skills oficiales](../../.agents/skills)
- [Especificación 007](../../specs/007-busqueda-documentos/spec.md), [plan](../../specs/007-busqueda-documentos/plan.md), [tareas](../../specs/007-busqueda-documentos/tasks.md)
- [Evidencia](../../specs/007-busqueda-documentos/evidence.md) y [convergencia](../../specs/007-busqueda-documentos/converge.md)

Clonar backend y frontend como carpetas hermanas, `superkanes_backend/` y
`superkanes_frontend/`. Cada uno conserva su Git y remoto. No introducirlos en otro
repositorio ni convertirlos en submódulos. Abrir backend en Codex permite descubrir
sus instrucciones y skills; mantener frontend disponible como carpeta hermana.

En el workspace existente, `document-management` enlaza al backend para conservar
referencias antiguas. La raíz conserva en Git el baseline documental y enlaces;
no se publica ese Git en el remoto del backend ni se necesita un tercer remoto.
Las especificaciones 001–006 son antecedentes conservados, no entregas nuevas.

## Paso 1: proteger y verificar el estado actual

Desde la carpeta padre de los dos repositorios:

```sh
git -C superkanes_backend status --short --branch
git -C superkanes_frontend status --short --branch
# Guardar cambios propios antes de continuar; no incluir trabajo ajeno por accidente.
git -C superkanes_backend switch -c feature/mi-incremento
git -C superkanes_frontend switch -c feature/mi-incremento
```

En esta adopción los baselines fueron backend `8718c6e`, frontend `377a1b8` y
respaldo documental local `1a45575`. Ambos repositorios de código ya tenían un commit
local adicional a origin/main. La publicación del incremento debe excluir esos commits
anteriores mediante ramas de revisión aisladas; no borrar el trabajo de las ramas locales.

## Paso 2: integración de Spec Kit para Codex

La CLI local era `1.2.3.dev0`; ya existía integración Copilot/bash. Se añadió Codex con:

```sh
# Comando ya ejecutado durante la adopción; no hace falta repetirlo al clonar.
specify integration install codex --script sh --integration-options='--skills' --force
```

`--force` en este comando permite coexistencia con Copilot. No se ejecutó
`init --here --force` sobre las plantillas personalizadas. Se revisaron diff y archivos
nuevos. `.specify/integration.json` selecciona Codex como predeterminado.
Se usa bash por el entorno macOS/zsh actual, no PowerShell.

Las skills están versionadas en `.agents/skills`; abrir una nueva sesión en backend
si la sesión actual no las descubre. No almacenar tokens ni credenciales de Codex en Git.

## Pasos 3–8: recorrido en el chat de Codex

1. Analizar antes de modificar: componentes, rutas, persistencia, auth, permisos,
   pruebas y extensiones. Separar hechos del código, hipótesis y riesgos.
2. `$speckit-constitution`: conservar arquitectura, contratos públicos, datos y patrones.
3. `$speckit-specify`: definir un cambio, actores, requisitos medibles y Non-Goals.
4. `$speckit-clarify`: resolver identificadores, permisos, estados y casos límite.
5. `$speckit-plan`: contrastar el diseño con servicios, UI, DTO y tests existentes.
6. `$speckit-checklist` y `$speckit-tasks`: revisar calidad y tareas verificables.
7. `$speckit-analyze`: detectar contradicciones y alcance no justificado antes de programar.
8. `$speckit-implement`: ejecutar el incremento con pruebas nuevas y de regresión.
9. `$speckit-converge`: revisar código contra spec/plan/tasks; añadir trabajo faltante,
   corregir y repetir pruebas afectadas. Revisar diff, commits y PR con el equipo.

Estos nombres corresponden a `/speckit.constitution`, etc., del material docente,
pero la integración instalada usa skills `$speckit-*`. **Son instrucciones de chat,
no comandos de terminal.** Converge no sustituye pruebas ni aprobación del equipo.
No atribuir contribuciones a integrantes que no las han realizado.

Desde backend, seleccionar el incremento explícitamente:

```sh
SPECIFY_FEATURE_DIRECTORY=specs/007-busqueda-documentos \
  bash .specify/scripts/bash/check-prerequisites.sh --json --require-spec --require-tasks --include-tasks
```

La especificación 007 recorre el proceso completo: búsqueda de versiones documentales
por UUID existente, dentro del paciente y con los permisos vigentes. No crea códigos,
no modifica datos y no introduce dependencias. Cambiar primero la spec si cambia alcance.

## Arranque y comprobaciones

Usar Node 24 y npm; `npm ci` en cada proyecto. Configurar variables privadas según
`.env.example` y el [README backend](../../README.md). Nunca copiar secretos a specs.
Backend: `npm run start:dev`; frontend: `npm run dev -- --host localhost --port 5173 --strictPort`.
PostgreSQL y MinIO deben estar disponibles. El Compose del backend ofrece el entorno
completo; revisar variables y volúmenes antes de iniciarlo. Las migraciones usan el
proceso separado existente, no el arranque de HTTP. No ejecutar pruebas en producción.

Desde backend:

```sh
bash scripts/verify-sdd.sh
```

Para regresión completa: PostgreSQL/MinIO locales y Chromium instalado. En frontend:

```sh
npx playwright install chromium
npm run dev -- --host localhost --port 5174 --strictPort
```

En otra terminal, desde backend:

```sh
SDD_INTEGRATION=true bash scripts/verify-sdd.sh
```

El script comprueba versión de Node, prerequisitos SDD, diff, build, lint, Jest y e2e.
El modo de integración añade test:auth y test:crud con MinIO y navegador. Los fixtures
usan BD efímera y datos sintéticos; no equivalen a una validación de producción.
No sustituir test:crud por test:integration sin revisar su conexión a la base configurada.
Una prueba omitida no cuenta como aprobada. Consultar [quickstart](../../specs/007-busqueda-documentos/quickstart.md).

## Entrega y recuperación

Desplegar backend antes de frontend, porque la UI envía un parámetro nuevo. No hay
migraciones ni rollback de datos para 007. Ante una regresión, revertir el commit
correspondiente mediante `git revert`, conservando historial y trabajo ajeno.
Los PR se entregan en borrador: el equipo revisa aceptación antes de merge/despliegue.

## Referencias verificadas

- [GitHub Spec Kit](https://github.com/github/spec-kit)
- [Integración Codex](https://github.github.io/spec-kit/integrations/codex.html)
- [Flujo Agentic SDD](https://github.github.com/spec-kit/reference/agentic-sdd.html)

La sintaxis se contrastó también con `specify init --help` y `specify integration install --help` locales.
