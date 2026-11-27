# [CHECKLIST TYPE] Checklist: SUPERKANES — [FEATURE NAME]

**Purpose**: Revisar la calidad de los requisitos del cambio.
**Created**: [DATE]
**Feature**: [Enlace a spec.md]
**Review Ownership**: El revisor marca `[x]` cuando el requisito está suficientemente definido; no significa que esté implementado.

Concretar los puntos para esta funcionalidad y eliminar los que no apliquen.
Vincular cada observación con el requisito o escenario correspondiente.

## Alcance y aceptación

- [ ] CHK001 ¿Se identifica la acción, el actor, el módulo y el comportamiento actual y esperado?
- [ ] CHK002 ¿El alcance y sus exclusiones evitan ampliar el cambio a toda la aplicación?
- [ ] CHK003 ¿Cada historia tiene resultados observables y casos de rechazo concretos?

## Organización, permisos y datos

- [ ] CHK004 ¿Se definen permisos y alcance de organización/sede para las operaciones afectadas?
- [ ] CHK005 ¿Se especifican campos obligatorios, relaciones válidas y datos gestionados por el servidor?
- [ ] CHK006 ¿Se define el comportamiento ante cambios concurrentes y envíos repetidos?
- [ ] CHK007 ¿Se detallan estados permitidos, efecto de la baja y conservación del historial cuando aplica?

## Experiencia e integración

- [ ] CHK008 ¿Se definen los estados de carga, vacío, éxito y error de las pantallas afectadas?
- [ ] CHK009 ¿Se distingue una operación completa de la simple consulta o edición de metadatos?
- [ ] CHK010 ¿Los criterios de aceptación son verificables sin inventar métricas o datos de demostración?

## Notes

`/speckit-implement` consulta este checklist y no cambia sus marcas.
`checklists/requirements.md` conserva el ciclo propio de `/speckit-specify` y `/speckit-clarify`.
[Registrar requisitos incompletos, decisiones y enlaces de evidencia.]
