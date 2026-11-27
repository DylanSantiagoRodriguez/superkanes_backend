# Constitución del Proyecto: SUPERKANES

Esta plantilla se usa para revisar la constitución existente en
`.specify/memory/constitution.md`; no crear una segunda constitución ni sustituir
reglas vigentes por ejemplos genéricos. Conservar las reglas no afectadas y explicar
cada cambio en el informe de sincronización.

## 1. Naturaleza del Proyecto

Gestión de clínicas veterinarias y peluquería para mascotas: organizaciones, sedes,
usuarios, tutores, mascotas, agenda, historia clínica, vacunación y peluquería.
[Precisar únicamente cambios de alcance solicitados.]

## 2. Stack Tecnológico (Reglas de Implementación)

Backend NestJS 11, TypeScript, Node.js 24, PostgreSQL y TypeORM.
Frontend React 19, TypeScript y Vite, según `superkanes_frontend/spec.md`.
El Dockerfile del backend usa compilación por etapas y usuario `node`.
[Documentar cambios explícitos de stack; no asumir migraciones a Vue ni incorporación de Redis.]

## 3. Reglas de Dominio y Lógica de Negocio

Conservar aislamiento por organización, permisos por acción y sede, integridad de
relaciones, transacciones, autoría e historial clínicos, estados permitidos,
historial de tutores, consentimientos, idempotencia y control de versión.
[Actualizar únicamente reglas justificadas por el cambio solicitado.]

## 4. Estructura y Estilo de Código

Código en `superkanes_backend/` y `superkanes_frontend/` desde `SUPERKANES/`.
Spec Kit en `superkanes_backend/.specify/` y especificaciones nuevas en
`superkanes_backend/specs/<numero>-<nombre>/`.
Conservar módulos de dominio, DTO y los componentes compartidos existentes.
[Detallar modificaciones de estructura solo cuando sean necesarias.]

## 5. Manejo de Errores y Validaciones

Conservar validaciones del servidor, contratos HTTP, tratamiento de conflictos y
confidencialidad. Token de acceso en memoria, renovación mediante cookie HttpOnly
y protección CSRF existente. No exponer secretos en variables públicas del frontend.
[Precisar nuevas reglas sin debilitar las existentes.]

## 6. Comportamiento del Agente de IA (Reglas SDD)

Especificar el cambio concreto antes de implementarlo, preservar contratos ajenos
al alcance, reutilizar infraestructura y verificar los proyectos afectados.
Documentar evidencia y limitaciones; no presentar datos ficticios o mocks como integración real.
[Conservar y ajustar las reglas de trabajo vigentes según la solicitud.]

## 7. Adopción y relación con Spec Kit

La constitución canónica está en `superkanes_backend/.specify/memory/constitution.md`.
`CONSTITUCION.md` en la raíz solo enlaza a ella. Registrar versión, fecha, motivo y
documentos afectados por cada actualización.

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
