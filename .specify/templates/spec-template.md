# Feature Specification: SUPERKANES — [Nombre del cambio]

**Feature Branch**: [Rama si existe; no crear una por defecto]
**Created**: [DATE]
**Status**: Draft
**Input**: User description: "$ARGUMENTS"

## Alcance del cambio

- **Área**: [Agenda / mascotas y tutores / historia clínica / peluquería / vacunación / reportes / configuración / autenticación]
- **Actor y contexto**: [Personal que realiza la acción, organización y sede si aplica]
- **Comportamiento actual**: [Qué ocurre hoy y dónde se observa]
- **Comportamiento esperado**: [Cambio concreto solicitado]
- **Incluye**: [Operaciones o pantallas afectadas]
- **Fuera de alcance**: [Límites de este cambio]

Describir solo la funcionalidad solicitada. SUPERKANES ya gestiona sesiones,
organizaciones y recursos; no especificar de nuevo toda la aplicación.
Los detalles de código, endpoints y migraciones se concretan en `plan.md` y `contracts/`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - [Acción del usuario] (Priority: P1)

Como [actor autorizado] de [organización/sede], necesito [acción concreta]
para [resultado observable en la atención o administración].

**Why this priority**: [Valor de este cambio]
**Independent Test**: [Datos previos, acción y resultado verificable]

**Acceptance Scenarios**:

1. **Given** [sesión, permiso y registro en estado válido], **When** [acción], **Then** [resultado persistido y visible].
2. **Given** [permiso insuficiente u otra organización], **When** [acción], **Then** [rechazo sin exponer ni modificar datos ajenos].
3. **Given** [dato inválido o estado incompatible], **When** [acción], **Then** [error corregible y datos preservados].

Añadir historias únicamente si el alcance las necesita; cada una debe poder verificarse.

### Edge Cases

Seleccionar y concretar los casos aplicables; quitar los ajenos al cambio:

- Sesión vencida o cambio de organización durante la operación.
- Lista vacía, referencia inaccesible o fallo de conexión.
- Registro modificado por otro usuario o envío repetido de una misma alta.
- Intento de modificar un registro clínico cerrado o un estado terminal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: [Actor] puede [acción] sobre [registro] cuando [permiso y estado].
- **FR-002**: La operación valida [campos, límites y relaciones concretos].
- **FR-003**: El resultado conserva [organización, autoría e historial aplicables].
- **FR-004**: El usuario recibe [confirmación o error concreto] y observa [estado final].

Precisar transiciones y efecto de la baja cuando apliquen (eliminar, cancelar,
desactivar o anular). No inventar permisos, estados ni procesos a partir de tablas.

### Key Entities *(include if feature involves data)*

- **[Entidad existente afectada]**: [Datos que cambian, relaciones y restricciones].

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [El actor completa el flujo con los datos definidos y observa el resultado esperado].
- **SC-002**: [Los casos de rechazo definidos preservan los datos y explican cómo continuar].

Usar criterios comprobables del cambio. No inventar cifras de carga, tiempos o
porcentajes de mejora sin una necesidad y una forma de medirlos.

## Assumptions

- Se reutilizan la sesión, la selección de organización y los permisos existentes.
- Se preservan las reglas clínicas y los contratos vigentes salvo cambio explícito.
- [Supuestos adicionales específicos; marcar decisiones pendientes con NEEDS CLARIFICATION].
