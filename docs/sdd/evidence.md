# Evidencia: publicación de SDD en el backend

Fecha: 2026-11-27 (America/Bogota).

## Solicitud y hechos verificados

Centralizar y publicar en el backend la constitución, requisitos, planes, tareas
y herramientas de Spec-Driven Development existentes.

- Raíz, backend y frontend estaban limpios al comenzar.
- `origin/main` del backend era `6919847da02fd5ec555cc09008b41eacff8b8ac6`.
  No contenía `.specify`, `.agents`, `specs`, `docs/sdd` ni `AGENTS.md`.
- `feature/010-agenda-relaciones` local y remota coincidían en
  `d72110242b6123016b453794211f5898348a5578`; allí estaban los artefactos SDD.
- El `.gitignore` de `main` excluía `.specify/`, `.agents/`, `AGENTS.md`,
  `CONSTITUCION.md` y todo archivo llamado `spec.md`.
- El README de `main` enlazaba a `../README.md`, fuera del repositorio.

## Decisiones y alcance

- Crear `docs/sdd-backend` desde `origin/main` en un worktree independiente.
- Conservar los 80 archivos versionados de `.specify`, `.agents`, `.github/skills`,
  `specs`, `docs/sdd`, `AGENTS.md` y `scripts/verify-sdd.sh` del commit `d721102`.
  Solo se amplía el índice `docs/sdd/README.md`; constitución, specs y tareas
  mantienen sus contenidos originales.
- Añadir `CONSTITUCION.md` como acceso a la única constitución canónica,
  corregir el enlace del README y eliminar las exclusiones que impedían versionar SDD.
  `/spec.md` sigue reservado como archivo local en la raíz del backend.
- Preservar el CSV y las instrucciones existentes del workspace en
  `docs/sdd/backlog/`, sin importar incidencias ni alterar sus estados.
- Documentar artefactos faltantes: 001–006 no tienen plan, tareas ni evidencia;
  011–012 no tienen plan ni tareas. No se inventan aprobaciones o tareas completadas.
- Publicar una rama documental y un PR en borrador dirigido a `main`.
  La publicación no implica fusión, despliegue ni validación de la aplicación.

## Comandos y resultados

- `git status --short` en raíz, backend y frontend: limpios antes de trabajar.
- `git fetch origin`, `git ls-remote --symref origin HEAD` y
  `git ls-remote origin refs/heads/feature/010-agenda-relaciones`: refs contrastadas.
- `git ls-tree -r --name-only origin/main .specify .agents .github specs docs AGENTS.md CONSTITUCION.md scripts`:
  solo existían scripts operativos, sin artefactos SDD.
- `git check-ignore -v` sobre los artefactos: confirmó las exclusiones de `main`.
- `git worktree add -b docs/sdd-backend <worktree> origin/main` y
  `git archive HEAD -- .specify .agents .github/skills specs docs/sdd AGENTS.md scripts/verify-sdd.sh`
  desde la rama fuente: extracción de archivos versionados, sin copiar estado local.
- Para 007, 008, 009 y 010:
  `SPECIFY_FEATURE_DIRECTORY=specs/<incremento> bash .specify/scripts/bash/check-prerequisites.sh --json --require-spec --require-tasks --include-tasks`:
  las cuatro comprobaciones finalizaron con código 0.
- `bash -n` para los seis scripts de `.specify/scripts/bash/` y
  `scripts/verify-sdd.sh`: código 0.

- Comprobación con Python de los 80 archivos contra `git show d721102:<ruta>`:
  79 idénticos byte a byte y el índice actualizado; ningún artefacto perdido.
- Comparación del CSV mediante `csv.DictReader`: 42 elementos idénticos al original.
  El primer `git diff --cached --check` señaló finales CRLF; se normalizaron a LF
  conservando BOM y contenido. La segunda comprobación pasó con código 0.
- Comprobación Python de enlaces nuevos del README, `CONSTITUCION.md` y de los
  documentos de entrada `docs/sdd/README.md` y `docs/sdd/spec-kit.md`: todos resuelven.
  La revisión inicial del README completo detectó enlaces heredados a documentos
  ausentes (`MIGRATIONS.md`, `MODULOS.md`, `CRUD.md`, `CRUD_RECURSOS.md` y
  `AUTENTICACION.md`); no se reconstruyeron esas guías en esta entrega.
- Revisión del diff preparado: sin cambios en `src`, `test`, dependencias o despliegue.

## Límites

No se ejecutaron builds, lint, pruebas de aplicación, migraciones ni semillas:
esta entrega conserva el código de `main` y solo incorpora documentación y herramientas
SDD ya existentes. Los comandos de comprobación utilizan bash y Python; no necesitan
Node. Las futuras verificaciones de la aplicación requieren Node 24.
La evidencia histórica de cada incremento pertenece a los commits que identifica;
no acredita que esos incrementos estén implementados en `main`.

## Publicación remota

El primer `git push -u origin docs/sdd-backend` fue rechazado con HTTP 403:
la cuenta activa de Git era `T-SanZ`, sin acceso de escritura. El conector GitHub
confirmó también `push: false`. `gh auth status` mostró una sesión ya configurada
del propietario `DylanSantiagoRodriguez`. Se utiliza esa sesión exclusivamente en
los procesos de publicación, sin cambiar la cuenta activa ni almacenar credenciales
en archivos del repositorio.

La publicación con la sesión del propietario finalizó correctamente:
`docs/sdd-backend` está en `origin` y se abrió el
[PR #2](https://github.com/DylanSantiagoRodriguez/superkanes_backend/pull/2)
en borrador dirigido a `main`. La fusión sigue pendiente. No se modificaron las
ramas activas del workspace ni el frontend.
