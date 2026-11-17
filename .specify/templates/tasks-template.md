---
description: "Tareas concretas para cambios en SUPERKANES"
---

# Tasks: SUPERKANES — [FEATURE NAME]

**Input**: `superkanes_backend/specs/[###-feature-name]/`
**Prerequisites**: `spec.md`, `plan.md` y contratos/modelo de datos cuando apliquen.

## Format: `[ID] [P?] [Story] Description`

- Usar `- [ ] T001 [US1] Acción en ruta/exacta`.
- `[P]` solo indica tareas independientes sin archivos compartidos; no exige delegación.
- Rutas desde `SUPERKANES/`; desde `superkanes_backend/` usar `../` para código.
- Sustituir los ejemplos por tareas del cambio. Eliminar fases que no apliquen.
- No inicializar proyectos, autenticación, ORM ni herramientas ya existentes.

## Phase 1: Preparación específica

- [ ] T001 Revisar [archivos afectados] y registrar el contrato actual en superkanes_backend/specs/[###-feature-name]/plan.md.

## Phase 2: User Story 1 - [Acción concreta] (Priority: P1)

**Goal**: [Resultado observable]
**Independent Test**: [Escenario de aceptación de spec.md]

Seleccionar solo las tareas necesarias y concretar sus rutas:

- [ ] T002 [US1] Ajustar [campos/validaciones] en superkanes_backend/src/modules/[modulo]/dto/[archivo].ts.
- [ ] T003 [US1] Implementar [regla/caso de uso] en superkanes_backend/src/modules/[modulo]/[modulo].service.ts reutilizando autorización y persistencia existentes.
- [ ] T004 [US1] Ajustar [contrato del recurso] en [archivo concreto de superkanes_backend/src/resources/].
- [ ] T005 [US1] Conectar [acción de pantalla] en [archivo concreto de superkanes_frontend/src/features/].
- [ ] T006 [US1] Verificar [casos de aceptación y rechazo] en [prueba existente o nueva justificada].

Si cambia esquema, añadir la migración en `superkanes_backend/src/database/migrations/`
y su recuperación antes de las tareas que dependan de ella.
Repetir la fase por historia únicamente cuando la especificación lo necesite.

## Phase N: Verificación y documentación

- [ ] T007 Ejecutar build y lint de los proyectos afectados según plan.md.
- [ ] T008 Ejecutar las pruebas pertinentes del backend y verificar en navegador el flujo afectado cuando haya cambios de UI.
- [ ] T009 Registrar resultados y limitaciones en superkanes_backend/specs/[###-feature-name]/quickstart.md.

Los cambios de autorización, integridad, concurrencia o migraciones requieren pruebas
pertinentes; verificar aislamiento y restricciones contra PostgreSQL real.
No añadir pruebas que solo repitan la implementación ni afirmar integración por mocks.

## Dependencies & Execution Order

[Dependencias concretas entre tareas. Contratos antes de su consumo; migraciones antes
de persistir nuevos campos. Indicar qué tareas realmente pueden ejecutarse en paralelo.]

## Implementation Strategy

Completar la historia prioritaria, comprobar su aceptación y continuar con las demás.
No incluir refactorizaciones, optimizaciones ni infraestructura ajenas al cambio.
