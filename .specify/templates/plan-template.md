# Implementation Plan: SUPERKANES — [FEATURE]

**Branch**: [Rama si aplica] | **Date**: [DATE] | **Spec**: [spec.md](spec.md)
**Input**: `superkanes_backend/specs/[###-feature-name]/spec.md`

## Summary

[Problema concreto, comportamiento resultante y archivos que se deben modificar.]

## Technical Context

- **Language/Version**: TypeScript; Node.js 24.
- **Backend**: NestJS 11, TypeORM, PostgreSQL; DTO con class-validator/class-transformer.
- **Frontend**: React 19, Vite, TypeScript; componentes `.tsx` y estilos existentes.
- **API**: `/api/v1`; catálogo autorizado en `/api/v1/resources`.
- **Sesión**: JWT en memoria; renovación por cookie HttpOnly y protección CSRF existente.
- **Organización**: `X-Organization-Id`, membresía y permisos comprobados en backend.
- **Escrituras**: `Idempotency-Key` para altas; `If-Match` para cambios y bajas según contrato.
- **Persistencia**: `ResourceAccessService.run()` y `DatabaseService.withTenant()`; usar el EntityManager de la transacción.
- **Despliegue actual del backend**: `superkanes_backend/Dockerfile`, Node 24, compilación por etapas, usuario `node`.
- **Alcance técnico del cambio**: [Módulos, rutas HTTP, componentes y datos concretos].

No introducir Vue, Redis, microservicios u otra infraestructura salvo que sea parte
explícita del cambio. No atribuir al sistema prestaciones no verificadas.

## Constitution Check

Revisar antes del diseño y al terminarlo. Para cada punto registrar evidencia o
justificar que no aplica al cambio:

- El alcance corresponde a `spec.md` y conserva el stack vigente.
- La lectura/escritura verifica organización, membresía, permisos y sede aplicable.
- Las relaciones, autoría clínica, historial y transiciones respetan las reglas existentes.
- Las escrituras mantienen idempotencia, versión y transacción cuando corresponde.
- Un cambio de esquema incluye migración y recuperación; la API mantiene `synchronize` y `migrationsRun` desactivados.
- Las verificaciones cubren los riesgos reales del cambio y no presentan mocks como integración completa.

Referencia: `superkanes_backend/.specify/memory/constitution.md`.

## Project Structure

### Documentation (this feature)

```text
superkanes_backend/specs/[###-feature]/
  spec.md
  plan.md
  research.md       # Decisiones que requieran investigación
  data-model.md     # Si cambian datos o relaciones
  contracts/        # Si se definen o modifican contratos
  quickstart.md     # Pasos para validar el cambio
  tasks.md
```

### Source Code (workspace root: SUPERKANES/)

```text
superkanes_backend/
  src/auth/
  src/common/
  src/config/
  src/database/migrations/
  src/health/
  src/modules/<modulo>/   # Entidades, DTO, servicio y controlador
  src/resources/         # Catálogo, autorización, reglas y persistencia
  test/
  Dockerfile
superkanes_frontend/
  src/features/auth/
  src/features/workspace/
  src/shared/api/
  src/shared/layout/
  src/shared/ui/
```

**Structure Decision**: [Enumerar archivos existentes que se reutilizan y archivos nuevos necesarios].
Las rutas anteriores parten de `SUPERKANES/`; desde `superkanes_backend/` llevan `../`.

## Contratos y datos afectados

[Para cada operación: método/ruta, DTO de entrada/salida, permisos, validaciones,
estados, códigos de error y cambios en el catálogo. Si no cambia contratos, indicarlo.]

[Para cambios de datos: entidad, migración, impacto en registros existentes y recuperación.]

## Verificación

Ejecutar desde la raíz del workspace, seleccionando proyectos afectados:

```sh
npm --prefix superkanes_backend run build
npm --prefix superkanes_backend run lint
npm --prefix superkanes_backend test -- --runInBand
npm --prefix superkanes_frontend run build
npm --prefix superkanes_frontend run lint
```

Cuando el alcance lo requiera, usar los scripts existentes del backend:
`test:e2e`, `test:integration`, `test:crud` y `test:auth`.
Revisar sus requisitos de entorno y PostgreSQL antes de ejecutarlos.
El frontend no tiene un script `test`; documentar el flujo de navegador aplicable.

[Incluir escenarios de aceptación, resultados esperados y dependencias necesarias.]

## Complexity Tracking

[Solo si el cambio requiere una excepción: regla afectada, motivo y decisión explícita.]
