<!--
Sync Impact Report: 2.0.0 -> 2.1.0 (2026-11-17, America/Bogota).
Añade flujo Codex Brownfield y versionado del workspace; conserva principios de dominio.
Plantillas existentes revisadas y preservadas. Afecta 007 y futuros incrementos.
001–006 conservan alcance histórico. README y AGENTS alineados.
-->

# Constitución del Proyecto: SUPERKANES

Versión: 2.1.0 · Fecha: 17 de noviembre de 2026

Este documento define las reglas transversales del backend y del frontend de SUPERKANES. Las funcionalidades, los contratos y los criterios de aceptación de cada cambio se describen en su `spec.md`. Cuando cambie una regla, se debe actualizar primero esta constitución y revisar las especificaciones afectadas.

## 1. Naturaleza del Proyecto

SUPERKANES es una aplicación web de gestión de clínicas veterinarias y servicios de peluquería para mascotas. Está destinada al personal administrativo, de recepción, veterinario y de peluquería de organizaciones con una o varias sedes.

Su propósito central es centralizar la información de mascotas y tutores y dar continuidad a la atención, manteniendo la integridad del historial y el acceso controlado a los datos de cada organización.

## 2. Stack Tecnológico (Reglas de Implementación)

- **Frontend / UI:** React 19 con TypeScript, Vite y componentes `.tsx`, conforme a `superkanes_frontend/spec.md`. Reutilizar las funcionalidades de `auth` y `workspace` y los componentes de `shared`.
- **Backend:** NestJS con TypeScript, organizado como monolito modular. Se conserva Node.js 24 como línea de ejecución del proyecto mientras una decisión documentada no la sustituya.
- **Base de datos:** PostgreSQL como fuente de verdad persistente. TypeORM integrado en NestJS para entidades, acceso a datos, transacciones y migraciones. Se permite SQL parametrizado cuando sea necesario para las reglas existentes, RLS, funciones y triggers.
- **Caché (solo si una especificación incorpora Redis):** datos reconstruibles, con tiempo de expiración e invalidación definidos por caso de uso. Las claves deben separar organizaciones y, cuando corresponda, usuarios o ámbitos de permisos. Una respuesta almacenada en caché no exime de validar autorización. Si Redis falla, las consultas deben recurrir a PostgreSQL sin alterar las reglas de integridad.
- **Contenedores:** conservar el Dockerfile existente del backend (Node.js 24, compilación por etapas y usuario `node`). Si el cambio incorpora una composición de servicios, separar backend, frontend, PostgreSQL y Redis cuando corresponda. PostgreSQL debe conservar sus datos en un volumen persistente. Las direcciones y credenciales se configuran mediante variables de entorno para permitir instancias independientes.
- **Migraciones:** deben ejecutarse mediante un servicio o trabajo Docker separado del proceso HTTP, usando la imagen del backend y el comando de migración compilado de TypeORM. Solo ese proceso recibe credenciales de propietario del esquema; la API utiliza un rol limitado, sin superusuario ni bypass de RLS. La ejecución de migraciones debe ser única y coordinada por despliegue.
- **Esquema:** `synchronize` y `migrationsRun` permanecen desactivados en la API. Todo cambio de esquema debe incluir una migración versionada y una estrategia de recuperación documentada. No se modifican migraciones ya aplicadas en entornos compartidos.
- **Lenguaje:** TypeScript para el código de aplicación del frontend y del backend; SQL para las operaciones de base de datos que lo requieran.
- **Dependencias:** incorporar únicamente dependencias necesarias para una especificación aprobada. No introducir otro framework de UI, ORM, motor de datos o arquitectura de microservicios sin actualizar esta constitución.

### Estado de adopción

El backend utiliza NestJS 11, TypeScript, PostgreSQL y TypeORM; el frontend utiliza React 19, TypeScript y Vite. Se conserva React según el alcance explícito de `superkanes_frontend/spec.md` del 20 de octubre de 2026. Este ajuste reemplaza la anterior intención de migrar a Vue; no requiere una migración del código.

Redis y la composición completa de servicios no se consideran implementados ni se añaden a cada tarea por defecto. Su incorporación y la ejecución aislada de migraciones requieren un cambio específico y verificable.

## 3. Reglas de Dominio y Lógica de Negocio

Estas reglas son obligatorias para toda implementación:

- **Aislamiento por organización:** toda lectura y escritura de datos de una clínica debe ejecutarse en el contexto de una organización autorizada. Se deben verificar identidad, organización activa, membresía activa y permisos antes de operar; las excepciones de administración de plataforma deben ser explícitas. Un identificador enviado por el cliente no acredita acceso.
- **Permisos por acción y sede:** el backend debe comprobar el permiso para cada operación y su alcance organizacional o de sede. Ocultar controles en la UI no sustituye la autorización. Un usuario no puede conceder permisos superiores a los propios ni modificar sus propias asignaciones de rol o membresía para elevar privilegios.
- **Integridad de relaciones:** antes de guardar se debe comprobar que los registros relacionados existen y pertenecen al contexto permitido. No se admiten referencias cruzadas entre organizaciones. Los campos de autoría, organización y auditoría controlados por el servidor no pueden imponerse desde la UI.
- **Transacciones:** las operaciones con varias escrituras dependientes deben confirmarse o revertirse como una unidad. Dentro de una transacción con contexto de organización se utiliza exclusivamente su `EntityManager` y sus repositorios; no se emplean repositorios globales que pierdan ese contexto.
- **Autoría clínica:** la autoría de atenciones, prescripciones y vacunaciones internas debe corresponder al profesional autenticado y habilitado. El cierre de una revisión clínica debe comprobar esa autoría y asignar responsable y fecha desde el servidor.
- **Historial clínico:** una revisión cerrada debe conservarse sin sobrescrituras; las correcciones deben registrarse mediante una nueva revisión vinculada. Una atención solo puede cerrarse cuando exista una revisión clínica cerrada. Las secciones deben validar su contenido contra una plantilla publicada.
- **Vacunación:** una vacunación registrada no se corrige sobrescribiendo sus datos clínicos. Se anula con motivo y la corrección se registra por separado. Si cumple un pendiente vacunal, debe resolverse esa relación mediante un procedimiento clínico coordinado antes de anularla.
- **Estados:** citas, atenciones, revisiones, servicios de peluquería, pendientes vacunales y consentimientos solo pueden recorrer las transiciones permitidas por sus contratos. No se pueden reabrir estados terminales mediante un CRUD genérico. Las especificaciones deben detallar las transiciones y sus precondiciones antes de cambiarlas.
- **Tutores:** los cambios de responsable de una mascota deben conservar la vigencia y el historial de sus vínculos; no se sustituyen las identidades de una relación existente para representar una transferencia.
- **Consentimientos y archivos:** un consentimiento debe usar una plantilla publicada y activa. Los archivos vinculados deben estar disponibles tras su validación; el hash del consentimiento debe coincidir con el documento. Se debe conservar la identidad del firmante al momento de la firma y la evidencia del documento firmado.
- **Concurrencia e idempotencia:** las altas de recursos deben respetar `Idempotency-Key` y las modificaciones el control de versión mediante `If-Match`, conforme al contrato de la API. No se deben sobrescribir cambios concurrentes de forma silenciosa ni duplicar altas por reintentos.
- **Procesos reservados:** los resultados de envío de comunicaciones y la disponibilidad de archivos solo pueden ser registrados por los procesos autorizados. La existencia de una tabla o un endpoint CRUD no equivale a disponer del proceso completo.
- **Datos demostrativos:** los datos ficticios deben estar identificados como demostración. No se presentan como información actual ni como registros persistidos de una clínica.

## 4. Estructura y Estilo de Código

### Organización

Se conservan las carpetas independientes actuales:

```text
SUPERKANES/
  CONSTITUCION.md     Enlace a la constitución canónica
  document-management/ -> superkanes_backend/ (compatibilidad local)
  superkanes_backend/
    .specify/        Constitución, plantillas y scripts de Spec Kit
    .agents/skills/  Integración Codex
    specs/           Especificaciones por funcionalidad
    docs/sdd/        Guía y evidencia de adopción
    src/
      auth/          Autenticación y sesiones
      common/        DTO y validaciones compartidas
      config/        Configuración y variables de entorno
      database/      TypeORM, contexto transaccional y migraciones
      health/        Salud y disponibilidad
      modules/       Módulos de dominio con entidades, DTO, servicios y controladores
      resources/     Contratos, autorización y persistencia compartida
    test/            Pruebas HTTP y de integración
  superkanes_frontend/
    src/
      features/      Funcionalidades con páginas, componentes, API y tipos
      shared/
        api/         Cliente HTTP compartido
        layout/      Estructura visual y navegación
        ui/          Componentes reutilizables
      assets/        Recursos visuales
```

Las especificaciones nuevas se generan en `superkanes_backend/specs/<numero>-<nombre>/`. Las rutas de código se expresan desde `SUPERKANES/`; desde `superkanes_backend/` se usa `./` o `../superkanes_frontend/`. Se conserva la especificación existente en `superkanes_frontend/spec.md` como antecedente de la integración. No se crean carpetas vacías por anticipación.

- **Responsabilidades:** los controladores gestionan HTTP; los servicios coordinan reglas y casos de uso; la capa de persistencia gestiona el acceso a datos. Los componentes de UI presentan información e interacciones; no acceden directamente a PostgreSQL ni Redis.
- **Simplicidad:** mantener módulos por dominio y componentes pequeños con responsabilidades concretas. Compartir código cuando exista una necesidad real; evitar abstracciones preventivas y duplicar reglas de negocio entre módulos.
- **Tipado:** mantener verificación estricta de TypeScript, contratos explícitos y DTO diferenciados para entrada y salida. Evitar `any`; los datos externos se validan antes de utilizarlos.
- **Nomenclatura:** `camelCase` para variables y funciones; `PascalCase` para clases, interfaces, tipos y componentes React; `kebab-case` para carpetas y archivos de servicios y módulos. Conservar `snake_case` en tablas, columnas y campos de API existentes. No renombrar contratos públicos como efecto secundario de una refactorización.
- **Estilos y accesibilidad:** reutilizar variables visuales y componentes compartidos; encapsular estilos mediante CSS Modules y los estilos existentes. Formularios y diálogos deben tener etiquetas, manejo de foco y uso por teclado.
- **Configuración:** secretos fuera del repositorio, de las imágenes y del código del frontend. Las variables `VITE_` son públicas. Validar configuración obligatoria al iniciar el backend.
- **Verificación:** ejecutar compilación y lint en los proyectos afectados por cambios de código. Los cambios de autorización, integridad, concurrencia o migraciones deben incluir pruebas pertinentes; el aislamiento entre organizaciones y las restricciones de PostgreSQL se verifican contra una base de pruebas real.

## 5. Manejo de Errores y Validaciones

- **UI:** validar campos para orientar al usuario, mostrar errores junto al campo correspondiente y explicar cómo corregirlos. Mostrar estados de carga, vacío, éxito y fallo; evitar envíos duplicados mientras una petición está en curso. No anunciar éxito hasta recibir confirmación del backend.
- **Sesión web:** conservar el token de acceso en memoria y la renovación en una cookie `HttpOnly`, con los atributos de seguridad correspondientes al entorno. Mantener la protección CSRF del contrato existente. No registrar contraseñas ni tokens, ni guardarlos en datos de demostración.
- **Backend:** validar cuerpos, parámetros y consultas mediante DTO y los validadores existentes. Rechazar propiedades no admitidas y comprobar formato, longitud, rangos, enumeraciones y relaciones. Las validaciones del frontend nunca sustituyen las del servidor ni las restricciones de base de datos.
- **Respuestas HTTP:** usar `400` para entradas inválidas, `401` para autenticación ausente o inválida, `403` para permisos insuficientes, `404` para recursos no disponibles, `409` para conflictos de negocio o integridad, `429` para límites de peticiones, `500` para fallos inesperados y `503` para indisponibilidad temporal. Conservar los códigos de precondición definidos por el contrato de `If-Match`.
- **Conflictos:** ante una versión desactualizada, solicitar recargar y revisar el registro antes de repetir la modificación. No reintentar automáticamente escrituras sin garantías de idempotencia.
- **Confidencialidad:** las respuestas y los mensajes visibles no deben exponer SQL, trazas, credenciales, infraestructura interna ni datos de otras organizaciones. Registrar el diagnóstico necesario en el servidor con identificador de petición y sin contenido clínico o personal innecesario.
- **Disponibilidad:** separar la comprobación de vida del proceso de la disponibilidad de sus dependencias. Si PostgreSQL no está disponible, la API no debe simular una escritura exitosa.

## 6. Comportamiento del Agente de IA (Reglas SDD)

- **Cero Código Sombra (Shadow Code):** implementar únicamente lo definido en las especificaciones aprobadas (`spec.md`). No añadir funcionalidades, dependencias ni complejidad «por si acaso».
- **Fuente de la Verdad:** si una solicitud contradice esta constitución o existe una inconsistencia entre reglas y especificaciones, detener la implementación afectada, explicar el conflicto y solicitar la actualización del documento correspondiente antes de modificar el código.
- **Especificación antes de implementación:** cada cambio funcional debe definir alcance, contratos, permisos, validaciones, estados, criterios de aceptación y efectos sobre datos cuando corresponda. Si falta una decisión de negocio necesaria, debe aclararse sin inventar reglas.
- **Cambios acotados:** preservar trabajo existente y contratos ajenos al alcance aprobado. Las migraciones tecnológicas y los cambios incompatibles requieren una especificación explícita con estrategia de transición.
- **Evidencia de entrega:** indicar qué cambió, qué verificaciones se ejecutaron y qué limitaciones permanecen. No declarar una integración terminada porque existan entidades, mocks, pantallas de demostración o documentación.
- **Evolución de la constitución:** toda modificación debe actualizar la versión y la fecha, explicar la decisión e identificar las especificaciones afectadas. Mantener este archivo como referencia común del backend y del frontend, evitando copias divergentes.

## 7. Adopción y relación con Spec Kit

La ubicación canónica es `superkanes_backend/.specify/memory/constitution.md`; `CONSTITUCION.md` en la raíz enlaza a este archivo para conservar las referencias de los proyectos. No mantener copias independientes.

Ejecutar los comandos de Spec Kit desde `superkanes_backend/`, que versiona la configuración y las especificaciones comunes. El frontend permanece en su repositorio hermano. Las plantillas deben describir únicamente el cambio solicitado: módulo afectado, comportamiento actual y esperado, permisos, estados, validaciones y aceptación. No volver a inicializar autenticación, base de datos o proyectos que ya existen.

La versión 2.0.0 alinea el stack con la especificación de integración React existente y adapta las plantillas al workspace. No modifica sus contratos funcionales.

**Version**: 2.1.0 | **Ratified**: 2026-10-19 | **Last Amended**: 2026-11-17

## 8. Adopción Codex Brownfield (2.1.0)

Cambio aditivo de proceso: integración Codex con skills y bash, manteniendo Copilot.
Por elección del usuario, backend versiona `.specify`, `.agents`, `specs`, AGENTS y docs/sdd.
La raíz conserva un baseline recuperable y enlaces; `document-management` apunta al backend.
Antes de cada incremento revisar estado de los tres, proteger cambios existentes y crear
ramas. No reinicializar ni reconstruir módulos. Contratos incompatibles requieren alcance
expreso; preservar datos y convenciones. Probar comportamiento nuevo y regresión.
Registrar hechos, hipótesis, decisiones, comandos y resultados en cada spec.
Converge detecta brechas; nunca reemplaza ejecución de pruebas ni aprobación humana.
Afecta al flujo de especificaciones futuras y a 007; no cambia alcance histórico 001–006.
