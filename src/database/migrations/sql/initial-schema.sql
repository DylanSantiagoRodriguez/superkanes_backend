-- PostgreSQL 16+. Instalacion inicial en una base VACIA. No elimina datos.

-- Generado por generate.py; reglas adicionales al final.


CREATE SCHEMA vet;

REVOKE CREATE ON SCHEMA vet FROM PUBLIC;

CREATE TABLE vet.usuario (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    proveedor_identidad text NOT NULL,
    identificador_externo text NOT NULL,
    nombre text NOT NULL,
    email text NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_usuario_1 UNIQUE (proveedor_identidad, identificador_externo),
    CONSTRAINT ck_usuario_1 CHECK (version > 0)
);

CREATE TABLE vet.organizacion (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    identificacion_fiscal text,
    estado text NOT NULL DEFAULT 'activa',
    zona_horaria_default text NOT NULL DEFAULT 'America/Bogota',
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT ck_organizacion_1 CHECK (version > 0),
    CONSTRAINT ck_organizacion_2 CHECK (estado IN ('activa', 'suspendida', 'inactiva'))
);

CREATE TABLE vet.sede (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    nombre text NOT NULL,
    codigo text NOT NULL,
    direccion text,
    telefono text,
    zona_horaria text NOT NULL DEFAULT 'America/Bogota',
    activa boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_sede_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_sede_2 UNIQUE (organizacion_id, codigo),
    CONSTRAINT ck_sede_1 CHECK (version > 0)
);

CREATE TABLE vet.membresia (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_membresia_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_membresia_2 UNIQUE (organizacion_id, usuario_id),
    CONSTRAINT ck_membresia_1 CHECK (version > 0)
);

CREATE TABLE vet.profesional (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    membresia_id uuid NOT NULL,
    nombre_profesional text NOT NULL,
    registro_profesional text,
    especialidad text,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_profesional_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_profesional_2 UNIQUE (organizacion_id, membresia_id),
    CONSTRAINT ck_profesional_1 CHECK (version > 0)
);

CREATE TABLE vet.rol (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_rol_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_rol_2 UNIQUE (organizacion_id, nombre),
    CONSTRAINT ck_rol_1 CHECK (version > 0)
);

CREATE TABLE vet.permiso (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    codigo text NOT NULL,
    descripcion text NOT NULL,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_permiso_1 UNIQUE (codigo),
    CONSTRAINT ck_permiso_1 CHECK (version > 0)
);

CREATE TABLE vet.rol_permiso (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    rol_id uuid NOT NULL,
    permiso_id uuid NOT NULL,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_rol_permiso_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_rol_permiso_2 UNIQUE (organizacion_id, rol_id, permiso_id),
    CONSTRAINT ck_rol_permiso_1 CHECK (version > 0)
);

CREATE TABLE vet.asignacion_rol (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    membresia_id uuid NOT NULL,
    rol_id uuid NOT NULL,
    sede_id uuid,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_asignacion_rol_1 UNIQUE (organizacion_id, id),
    CONSTRAINT ck_asignacion_rol_1 CHECK (version > 0)
);

CREATE TABLE vet.archivo (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    proveedor text NOT NULL,
    contenedor text NOT NULL,
    ruta_relativa text NOT NULL,
    version_objeto text,
    nombre_original text NOT NULL,
    mime_detectado text,
    tamano_bytes bigint,
    sha256 char(64),
    categoria text NOT NULL,
    estado_analisis text NOT NULL DEFAULT 'pendiente',
    cargado_en timestamptz NOT NULL DEFAULT now(),
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_archivo_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_archivo_2 UNIQUE (proveedor, contenedor, ruta_relativa),
    CONSTRAINT ck_archivo_1 CHECK (version > 0),
    CONSTRAINT ck_archivo_2 CHECK (proveedor IN ('minio', 'local')),
    CONSTRAINT ck_archivo_3 CHECK (estado_analisis IN ('pendiente', 'disponible', 'rechazado')),
    CONSTRAINT ck_archivo_4 CHECK (contenedor ~ '^[a-zA-Z0-9][a-zA-Z0-9_-]*$'),
    CONSTRAINT ck_archivo_5 CHECK (ruta_relativa <> '' AND ruta_relativa !~ '(^/|(^|/)\.\.?(/|$)|//|/$)' AND position(chr(92) in ruta_relativa) = 0 AND position(':' in ruta_relativa) = 0),
    CONSTRAINT ck_archivo_6 CHECK (proveedor = 'minio' OR version_objeto IS NULL),
    CONSTRAINT ck_archivo_7 CHECK (sha256 IS NULL OR sha256 ~ '^[0-9a-f]{64}$'),
    CONSTRAINT ck_archivo_8 CHECK (tamano_bytes IS NULL OR tamano_bytes >= 0),
    CONSTRAINT ck_archivo_9 CHECK (estado_analisis <> 'disponible' OR (mime_detectado IS NOT NULL AND tamano_bytes IS NOT NULL AND sha256 IS NOT NULL))
);

CREATE TABLE vet.tutor (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    nombres text NOT NULL,
    apellidos text NOT NULL,
    pais_documento char(2),
    tipo_documento text,
    numero_documento text,
    email text,
    direccion text,
    ciudad text,
    observaciones text,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_tutor_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_tutor_2 UNIQUE (organizacion_id, pais_documento, tipo_documento, numero_documento),
    CONSTRAINT ck_tutor_1 CHECK (version > 0),
    CONSTRAINT ck_tutor_2 CHECK (num_nonnulls(pais_documento,tipo_documento,numero_documento) IN (0,3)),
    CONSTRAINT ck_tutor_3 CHECK (numero_documento IS NULL OR btrim(numero_documento) <> '')
);

CREATE TABLE vet.telefono_tutor (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    tutor_id uuid NOT NULL,
    numero text NOT NULL,
    tipo text NOT NULL DEFAULT 'movil',
    principal boolean NOT NULL DEFAULT false,
    permite_mensajeria boolean NOT NULL DEFAULT false,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_telefono_tutor_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_telefono_tutor_2 UNIQUE (organizacion_id, tutor_id, numero),
    CONSTRAINT ck_telefono_tutor_1 CHECK (version > 0),
    CONSTRAINT ck_telefono_tutor_2 CHECK (tipo IN ('movil', 'fijo', 'otro'))
);

CREATE TABLE vet.preferencia_comunicacion (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    tutor_id uuid NOT NULL,
    canal text NOT NULL,
    finalidad text NOT NULL,
    estado text NOT NULL,
    registrada_en timestamptz NOT NULL DEFAULT now(),
    fuente text NOT NULL,
    evidencia_archivo_id uuid,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    CONSTRAINT uq_preferencia_comunicacion_1 UNIQUE (organizacion_id, id),
    CONSTRAINT ck_preferencia_comunicacion_1 CHECK (canal IN ('email', 'sms', 'whatsapp', 'push', 'telefono')),
    CONSTRAINT ck_preferencia_comunicacion_2 CHECK (estado IN ('aceptada', 'revocada'))
);

CREATE TABLE vet.especie (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    nombre text NOT NULL,
    activa boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_especie_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_especie_2 UNIQUE (organizacion_id, nombre),
    CONSTRAINT ck_especie_1 CHECK (version > 0)
);

CREATE TABLE vet.raza (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    especie_id uuid NOT NULL,
    nombre text NOT NULL,
    activa boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_raza_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_raza_2 UNIQUE (organizacion_id, especie_id, nombre),
    CONSTRAINT uq_raza_3 UNIQUE (organizacion_id, especie_id, id),
    CONSTRAINT ck_raza_1 CHECK (version > 0)
);

CREATE TABLE vet.mascota (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    codigo text NOT NULL,
    nombre text NOT NULL,
    especie_id uuid NOT NULL,
    raza_id uuid,
    sexo text NOT NULL DEFAULT 'desconocido',
    fecha_nacimiento date,
    nacimiento_estimado boolean NOT NULL DEFAULT false,
    color text,
    microchip text,
    esterilizada boolean,
    foto_archivo_id uuid,
    estado text NOT NULL DEFAULT 'activa',
    fecha_fallecimiento date,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_mascota_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_mascota_2 UNIQUE (organizacion_id, codigo),
    CONSTRAINT uq_mascota_3 UNIQUE (organizacion_id, microchip),
    CONSTRAINT ck_mascota_1 CHECK (version > 0),
    CONSTRAINT ck_mascota_2 CHECK (sexo IN ('macho', 'hembra', 'desconocido')),
    CONSTRAINT ck_mascota_3 CHECK (estado IN ('activa', 'inactiva', 'fallecida')),
    CONSTRAINT ck_mascota_4 CHECK (fecha_fallecimiento IS NULL OR fecha_nacimiento IS NULL OR fecha_fallecimiento >= fecha_nacimiento),
    CONSTRAINT ck_mascota_5 CHECK (fecha_fallecimiento IS NULL OR estado = 'fallecida')
);

CREATE TABLE vet.mascota_tutor (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    mascota_id uuid NOT NULL,
    tutor_id uuid NOT NULL,
    relacion text NOT NULL DEFAULT 'tutor',
    es_principal boolean NOT NULL DEFAULT false,
    autorizado_consentir boolean NOT NULL DEFAULT false,
    vigente_desde date NOT NULL DEFAULT CURRENT_DATE,
    vigente_hasta date,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_mascota_tutor_1 UNIQUE (organizacion_id, id),
    CONSTRAINT ck_mascota_tutor_1 CHECK (version > 0),
    CONSTRAINT ck_mascota_tutor_2 CHECK (vigente_hasta IS NULL OR vigente_hasta >= vigente_desde)
);

CREATE TABLE vet.alerta_mascota (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    mascota_id uuid NOT NULL,
    tipo text NOT NULL,
    descripcion text NOT NULL,
    severidad text NOT NULL,
    activa boolean NOT NULL DEFAULT true,
    detectada_en timestamptz NOT NULL DEFAULT now(),
    resuelta_en timestamptz,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_alerta_mascota_1 UNIQUE (organizacion_id, id),
    CONSTRAINT ck_alerta_mascota_1 CHECK (version > 0),
    CONSTRAINT ck_alerta_mascota_2 CHECK (severidad IN ('informativa', 'moderada', 'critica')),
    CONSTRAINT ck_alerta_mascota_3 CHECK (resuelta_en IS NULL OR resuelta_en >= detectada_en)
);

CREATE TABLE vet.laboratorio (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    nombre text NOT NULL,
    contacto text,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_laboratorio_1 UNIQUE (organizacion_id, id),
    CONSTRAINT ck_laboratorio_1 CHECK (version > 0)
);

CREATE TABLE vet.medicamento (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    nombre_comercial text NOT NULL,
    principio_activo text NOT NULL,
    concentracion text NOT NULL,
    forma_farmaceutica text NOT NULL,
    presentacion text NOT NULL,
    laboratorio_id uuid,
    foto_archivo_id uuid,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_medicamento_1 UNIQUE (organizacion_id, id),
    CONSTRAINT ck_medicamento_1 CHECK (version > 0)
);

CREATE TABLE vet.vacuna (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    nombre text NOT NULL,
    laboratorio_id uuid NOT NULL,
    presentacion text,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_vacuna_1 UNIQUE (organizacion_id, id),
    CONSTRAINT ck_vacuna_1 CHECK (version > 0)
);

CREATE TABLE vet.vacunacion (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    mascota_id uuid NOT NULL,
    sede_id uuid,
    vacuna_id uuid NOT NULL,
    aplicada_en timestamptz NOT NULL,
    origen text NOT NULL DEFAULT 'interna',
    peso_kg numeric(7,3),
    aplicada_por uuid,
    vacunador_externo text,
    procedencia_externa text,
    lote text,
    vencimiento_lote date,
    dosis numeric(8,3),
    unidad_dosis text,
    via text,
    descripcion_vacuna_emitida text NOT NULL,
    observaciones text,
    estado text NOT NULL DEFAULT 'aplicada',
    motivo_anulacion text,
    reemplaza_id uuid,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_vacunacion_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_vacunacion_2 UNIQUE (organizacion_id, mascota_id, id),
    CONSTRAINT uq_vacunacion_3 UNIQUE (organizacion_id, reemplaza_id),
    CONSTRAINT ck_vacunacion_1 CHECK (version > 0),
    CONSTRAINT ck_vacunacion_2 CHECK (origen IN ('interna', 'externa')),
    CONSTRAINT ck_vacunacion_3 CHECK (estado IN ('aplicada', 'anulada')),
    CONSTRAINT ck_vacunacion_4 CHECK ((origen = 'interna' AND sede_id IS NOT NULL AND aplicada_por IS NOT NULL AND peso_kg IS NOT NULL AND lote IS NOT NULL AND vacunador_externo IS NULL) OR (origen = 'externa' AND aplicada_por IS NULL AND vacunador_externo IS NOT NULL AND procedencia_externa IS NOT NULL)),
    CONSTRAINT ck_vacunacion_5 CHECK (peso_kg IS NULL OR peso_kg > 0),
    CONSTRAINT ck_vacunacion_6 CHECK (dosis IS NULL OR dosis > 0),
    CONSTRAINT ck_vacunacion_7 CHECK (num_nonnulls(dosis,unidad_dosis) IN (0,2)),
    CONSTRAINT ck_vacunacion_8 CHECK (estado <> 'anulada' OR nullif(btrim(motivo_anulacion),'') IS NOT NULL),
    CONSTRAINT ck_vacunacion_9 CHECK (reemplaza_id IS NULL OR reemplaza_id <> id)
);

CREATE TABLE vet.pendiente_vacunal (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    mascota_id uuid NOT NULL,
    vacunacion_origen_id uuid,
    vacuna_prevista_id uuid,
    indicacion text NOT NULL,
    fecha_objetivo date NOT NULL,
    estado text NOT NULL DEFAULT 'pendiente',
    vacunacion_cumplimiento_id uuid,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_pendiente_vacunal_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_pendiente_vacunal_2 UNIQUE (organizacion_id, mascota_id, id),
    CONSTRAINT ck_pendiente_vacunal_1 CHECK (version > 0),
    CONSTRAINT ck_pendiente_vacunal_2 CHECK (estado IN ('pendiente', 'cumplido', 'cancelado')),
    CONSTRAINT ck_pendiente_vacunal_3 CHECK ((estado = 'cumplido') = (vacunacion_cumplimiento_id IS NOT NULL))
);

CREATE TABLE vet.cita (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    mascota_id uuid NOT NULL,
    sede_id uuid NOT NULL,
    tutor_contacto_id uuid NOT NULL,
    tipo text NOT NULL,
    inicio timestamptz NOT NULL,
    fin timestamptz NOT NULL,
    responsable_id uuid,
    pendiente_vacunal_id uuid,
    estado text NOT NULL DEFAULT 'programada',
    notas text,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_cita_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_cita_2 UNIQUE (organizacion_id, mascota_id, sede_id, id),
    CONSTRAINT ck_cita_1 CHECK (version > 0),
    CONSTRAINT ck_cita_2 CHECK (tipo IN ('clinica', 'vacunacion', 'peluqueria')),
    CONSTRAINT ck_cita_3 CHECK (estado IN ('programada', 'confirmada', 'en_atencion', 'completada', 'cancelada', 'no_asistio')),
    CONSTRAINT ck_cita_4 CHECK (fin > inicio),
    CONSTRAINT ck_cita_5 CHECK (pendiente_vacunal_id IS NULL OR tipo = 'vacunacion')
);

CREATE TABLE vet.recordatorio (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    tutor_id uuid NOT NULL,
    cita_id uuid,
    pendiente_vacunal_id uuid,
    canal text NOT NULL,
    programado_en timestamptz NOT NULL,
    enviado_en timestamptz,
    estado text NOT NULL DEFAULT 'pendiente',
    intentos integer NOT NULL DEFAULT 0,
    clave_idempotencia text NOT NULL,
    referencia_proveedor text,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_recordatorio_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_recordatorio_2 UNIQUE (organizacion_id, clave_idempotencia),
    CONSTRAINT ck_recordatorio_1 CHECK (version > 0),
    CONSTRAINT ck_recordatorio_2 CHECK (num_nonnulls(cita_id,pendiente_vacunal_id) = 1),
    CONSTRAINT ck_recordatorio_3 CHECK (intentos >= 0),
    CONSTRAINT ck_recordatorio_4 CHECK (canal IN ('email', 'sms', 'whatsapp', 'push')),
    CONSTRAINT ck_recordatorio_5 CHECK (estado IN ('pendiente', 'procesando', 'enviado', 'fallido', 'cancelado'))
);

CREATE TABLE vet.atencion_clinica (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    mascota_id uuid NOT NULL,
    sede_id uuid NOT NULL,
    cita_id uuid,
    fecha_atencion timestamptz NOT NULL,
    profesional_id uuid NOT NULL,
    tutor_presente_id uuid,
    estado text NOT NULL DEFAULT 'abierta',
    motivo_anulacion text,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_atencion_clinica_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_atencion_clinica_2 UNIQUE (organizacion_id, cita_id),
    CONSTRAINT ck_atencion_clinica_1 CHECK (version > 0),
    CONSTRAINT ck_atencion_clinica_2 CHECK (estado IN ('abierta', 'cerrada', 'anulada')),
    CONSTRAINT ck_atencion_clinica_3 CHECK (estado <> 'anulada' OR nullif(btrim(motivo_anulacion),'') IS NOT NULL)
);

CREATE TABLE vet.revision_clinica (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    atencion_id uuid NOT NULL,
    numero integer NOT NULL,
    revision_previa_id uuid,
    motivo_cambio text,
    motivo_consulta text NOT NULL,
    anamnesis text,
    evaluacion text,
    plan text,
    estado text NOT NULL DEFAULT 'borrador',
    cerrada_en timestamptz,
    cerrada_por uuid,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_revision_clinica_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_revision_clinica_2 UNIQUE (organizacion_id, atencion_id, id),
    CONSTRAINT uq_revision_clinica_3 UNIQUE (organizacion_id, atencion_id, numero),
    CONSTRAINT uq_revision_clinica_4 UNIQUE (organizacion_id, revision_previa_id),
    CONSTRAINT ck_revision_clinica_1 CHECK (version > 0),
    CONSTRAINT ck_revision_clinica_2 CHECK (estado IN ('borrador', 'cerrada')),
    CONSTRAINT ck_revision_clinica_3 CHECK ((numero = 1 AND revision_previa_id IS NULL) OR (numero > 1 AND revision_previa_id IS NOT NULL AND nullif(btrim(motivo_cambio),'') IS NOT NULL)),
    CONSTRAINT ck_revision_clinica_4 CHECK (revision_previa_id IS NULL OR revision_previa_id <> id),
    CONSTRAINT ck_revision_clinica_5 CHECK ((estado = 'borrador' AND cerrada_en IS NULL AND cerrada_por IS NULL) OR (estado = 'cerrada' AND cerrada_en IS NOT NULL AND cerrada_por IS NOT NULL))
);

CREATE TABLE vet.tipo_seccion_clinica (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    codigo text NOT NULL,
    nombre text NOT NULL,
    orden integer NOT NULL DEFAULT 0,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_tipo_seccion_clinica_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_tipo_seccion_clinica_2 UNIQUE (organizacion_id, codigo),
    CONSTRAINT ck_tipo_seccion_clinica_1 CHECK (version > 0)
);

CREATE TABLE vet.plantilla_seccion (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    tipo_seccion_id uuid NOT NULL,
    numero_version integer NOT NULL,
    esquema_validacion jsonb NOT NULL,
    publicada_en timestamptz,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_plantilla_seccion_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_plantilla_seccion_2 UNIQUE (organizacion_id, tipo_seccion_id, numero_version),
    CONSTRAINT uq_plantilla_seccion_3 UNIQUE (organizacion_id, tipo_seccion_id, id),
    CONSTRAINT ck_plantilla_seccion_1 CHECK (version > 0),
    CONSTRAINT ck_plantilla_seccion_2 CHECK (numero_version > 0),
    CONSTRAINT ck_plantilla_seccion_3 CHECK (jsonb_typeof(esquema_validacion) = 'object')
);

CREATE TABLE vet.seccion_clinica (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    revision_id uuid NOT NULL,
    tipo_seccion_id uuid NOT NULL,
    plantilla_id uuid NOT NULL,
    estado_evaluacion text NOT NULL DEFAULT 'no_evaluado',
    hallazgos text,
    datos_estructurados jsonb NOT NULL DEFAULT '{}'::jsonb,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_seccion_clinica_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_seccion_clinica_2 UNIQUE (organizacion_id, revision_id, tipo_seccion_id),
    CONSTRAINT ck_seccion_clinica_1 CHECK (version > 0),
    CONSTRAINT ck_seccion_clinica_2 CHECK (estado_evaluacion IN ('no_evaluado', 'sin_hallazgos', 'con_hallazgos')),
    CONSTRAINT ck_seccion_clinica_3 CHECK (jsonb_typeof(datos_estructurados) = 'object')
);

CREATE TABLE vet.medicion_clinica (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    revision_id uuid NOT NULL,
    tipo text NOT NULL,
    valor numeric(10,3) NOT NULL,
    unidad text NOT NULL,
    medida_en timestamptz NOT NULL,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_medicion_clinica_1 UNIQUE (organizacion_id, id),
    CONSTRAINT ck_medicion_clinica_1 CHECK (version > 0),
    CONSTRAINT ck_medicion_clinica_2 CHECK (tipo <> 'peso' OR (valor > 0 AND unidad = 'kg'))
);

CREATE TABLE vet.diagnostico (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    codigo text,
    nombre text NOT NULL,
    sistema_codificacion text,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_diagnostico_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_diagnostico_2 UNIQUE (organizacion_id, sistema_codificacion, codigo),
    CONSTRAINT ck_diagnostico_1 CHECK (version > 0)
);

CREATE TABLE vet.diagnostico_atencion (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    revision_id uuid NOT NULL,
    diagnostico_id uuid NOT NULL,
    clasificacion text NOT NULL,
    observaciones text,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_diagnostico_atencion_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_diagnostico_atencion_2 UNIQUE (organizacion_id, revision_id, diagnostico_id),
    CONSTRAINT ck_diagnostico_atencion_1 CHECK (version > 0),
    CONSTRAINT ck_diagnostico_atencion_2 CHECK (clasificacion IN ('presuntivo', 'confirmado', 'descartado'))
);

CREATE TABLE vet.prescripcion (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    revision_id uuid NOT NULL,
    profesional_id uuid NOT NULL,
    emitida_en timestamptz NOT NULL DEFAULT now(),
    indicaciones_generales text,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_prescripcion_1 UNIQUE (organizacion_id, id),
    CONSTRAINT ck_prescripcion_1 CHECK (version > 0)
);

CREATE TABLE vet.prescripcion_item (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    prescripcion_id uuid NOT NULL,
    medicamento_id uuid NOT NULL,
    descripcion_emitida text NOT NULL,
    dosis numeric(12,4),
    unidad_dosis text,
    via text NOT NULL,
    frecuencia text NOT NULL,
    duracion text NOT NULL,
    cantidad numeric(12,3),
    instrucciones text NOT NULL,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_prescripcion_item_1 UNIQUE (organizacion_id, id),
    CONSTRAINT ck_prescripcion_item_1 CHECK (version > 0),
    CONSTRAINT ck_prescripcion_item_2 CHECK (dosis IS NULL OR dosis > 0),
    CONSTRAINT ck_prescripcion_item_3 CHECK (cantidad IS NULL OR cantidad > 0),
    CONSTRAINT ck_prescripcion_item_4 CHECK (num_nonnulls(dosis,unidad_dosis) IN (0,2))
);

CREATE TABLE vet.tipo_servicio (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    duracion_estimada_min integer,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_tipo_servicio_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_tipo_servicio_2 UNIQUE (organizacion_id, nombre),
    CONSTRAINT ck_tipo_servicio_1 CHECK (version > 0),
    CONSTRAINT ck_tipo_servicio_2 CHECK (duracion_estimada_min IS NULL OR duracion_estimada_min > 0)
);

CREATE TABLE vet.servicio_peluqueria (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    mascota_id uuid NOT NULL,
    sede_id uuid NOT NULL,
    cita_id uuid,
    fecha_servicio date NOT NULL,
    llegada_en timestamptz,
    inicio_en timestamptz,
    finalizado_en timestamptz,
    entregado_en timestamptz,
    responsable_id uuid NOT NULL,
    tutor_contacto_id uuid NOT NULL,
    telefono_contacto_servicio text NOT NULL,
    requiere_consentimiento boolean NOT NULL DEFAULT true,
    observaciones_ingreso text,
    incidentes text,
    estado text NOT NULL DEFAULT 'programado',
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_servicio_peluqueria_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_servicio_peluqueria_2 UNIQUE (organizacion_id, cita_id),
    CONSTRAINT ck_servicio_peluqueria_1 CHECK (version > 0),
    CONSTRAINT ck_servicio_peluqueria_2 CHECK (estado IN ('programado', 'recibido', 'en_servicio', 'finalizado', 'entregado', 'cancelado')),
    CONSTRAINT ck_servicio_peluqueria_3 CHECK (inicio_en IS NULL OR (llegada_en IS NOT NULL AND inicio_en >= llegada_en)),
    CONSTRAINT ck_servicio_peluqueria_4 CHECK (finalizado_en IS NULL OR (inicio_en IS NOT NULL AND finalizado_en >= inicio_en)),
    CONSTRAINT ck_servicio_peluqueria_5 CHECK (entregado_en IS NULL OR (finalizado_en IS NOT NULL AND entregado_en >= finalizado_en))
);

CREATE TABLE vet.peluqueria_item (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    servicio_id uuid NOT NULL,
    tipo_servicio_id uuid NOT NULL,
    instrucciones text,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_peluqueria_item_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_peluqueria_item_2 UNIQUE (organizacion_id, servicio_id, tipo_servicio_id),
    CONSTRAINT ck_peluqueria_item_1 CHECK (version > 0)
);

CREATE TABLE vet.plantilla_consentimiento (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    nombre text NOT NULL,
    numero_version integer NOT NULL,
    contenido text NOT NULL,
    publicada_en timestamptz,
    activa boolean NOT NULL DEFAULT true,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_plantilla_consentimiento_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_plantilla_consentimiento_2 UNIQUE (organizacion_id, nombre, numero_version),
    CONSTRAINT ck_plantilla_consentimiento_1 CHECK (version > 0),
    CONSTRAINT ck_plantilla_consentimiento_2 CHECK (numero_version > 0)
);

CREATE TABLE vet.consentimiento (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    servicio_id uuid NOT NULL,
    plantilla_id uuid NOT NULL,
    documento_archivo_id uuid NOT NULL,
    hash_documento char(64) NOT NULL,
    estado text NOT NULL DEFAULT 'pendiente',
    emitido_en timestamptz NOT NULL DEFAULT now(),
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_consentimiento_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_consentimiento_2 UNIQUE (organizacion_id, id, hash_documento),
    CONSTRAINT ck_consentimiento_1 CHECK (version > 0),
    CONSTRAINT ck_consentimiento_2 CHECK (estado IN ('pendiente', 'aceptado', 'rechazado', 'revocado')),
    CONSTRAINT ck_consentimiento_3 CHECK (hash_documento ~ '^[0-9a-f]{64}$')
);

CREATE TABLE vet.firma_consentimiento (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    consentimiento_id uuid NOT NULL,
    tutor_id uuid NOT NULL,
    identidad_firmante_snapshot jsonb NOT NULL,
    firmado_en timestamptz NOT NULL DEFAULT now(),
    metodo text NOT NULL,
    evidencia_archivo_id uuid NOT NULL,
    hash_documento_aceptado char(64) NOT NULL,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    CONSTRAINT uq_firma_consentimiento_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_firma_consentimiento_2 UNIQUE (organizacion_id, consentimiento_id, tutor_id),
    CONSTRAINT ck_firma_consentimiento_1 CHECK (metodo IN ('presencial_digital', 'documento_escaneado', 'firma_electronica')),
    CONSTRAINT ck_firma_consentimiento_2 CHECK (jsonb_typeof(identidad_firmante_snapshot) = 'object')
);

CREATE TABLE vet.adjunto_clinico (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    revision_id uuid NOT NULL,
    archivo_id uuid NOT NULL,
    descripcion text,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_adjunto_clinico_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_adjunto_clinico_2 UNIQUE (organizacion_id, revision_id, archivo_id),
    CONSTRAINT ck_adjunto_clinico_1 CHECK (version > 0)
);

CREATE TABLE vet.adjunto_vacunacion (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    vacunacion_id uuid NOT NULL,
    archivo_id uuid NOT NULL,
    descripcion text,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_adjunto_vacunacion_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_adjunto_vacunacion_2 UNIQUE (organizacion_id, vacunacion_id, archivo_id),
    CONSTRAINT ck_adjunto_vacunacion_1 CHECK (version > 0)
);

CREATE TABLE vet.adjunto_peluqueria (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    servicio_id uuid NOT NULL,
    archivo_id uuid NOT NULL,
    descripcion text,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_adjunto_peluqueria_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_adjunto_peluqueria_2 UNIQUE (organizacion_id, servicio_id, archivo_id),
    CONSTRAINT ck_adjunto_peluqueria_1 CHECK (version > 0)
);

CREATE TABLE vet.reporte_emitido (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    mascota_id uuid NOT NULL,
    tipo text NOT NULL,
    parametros jsonb NOT NULL DEFAULT '{}'::jsonb,
    datos_identificacion_snapshot jsonb NOT NULL,
    fuentes_versionadas jsonb NOT NULL,
    version_plantilla text NOT NULL,
    archivo_id uuid NOT NULL,
    emitido_en timestamptz NOT NULL DEFAULT now(),
    emitido_por uuid NOT NULL,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    CONSTRAINT uq_reporte_emitido_1 UNIQUE (organizacion_id, id),
    CONSTRAINT ck_reporte_emitido_1 CHECK (jsonb_typeof(parametros) = 'object'),
    CONSTRAINT ck_reporte_emitido_2 CHECK (jsonb_typeof(datos_identificacion_snapshot) = 'object'),
    CONSTRAINT ck_reporte_emitido_3 CHECK (jsonb_typeof(fuentes_versionadas) = 'array')
);

CREATE TABLE vet.evento_auditoria (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    actor_usuario_id uuid,
    actor_servicio text,
    accion text NOT NULL,
    entidad text NOT NULL,
    registro_id uuid NOT NULL,
    ocurrido_en timestamptz NOT NULL DEFAULT clock_timestamp(),
    campos_modificados jsonb NOT NULL DEFAULT '[]'::jsonb,
    motivo text,
    request_id uuid,
    ip inet,
    CONSTRAINT uq_evento_auditoria_1 UNIQUE (organizacion_id, id),
    CONSTRAINT ck_evento_auditoria_1 CHECK (jsonb_typeof(campos_modificados) = 'array')
);

CREATE TABLE vet.evento_salida (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organizacion_id uuid NOT NULL,
    tipo text NOT NULL,
    entidad_id uuid NOT NULL,
    payload jsonb NOT NULL,
    procesado_en timestamptz,
    intentos integer NOT NULL DEFAULT 0,
    clave_idempotencia text NOT NULL,
    creado_en timestamptz NOT NULL DEFAULT now(),
    creado_por uuid,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_por uuid,
    version integer NOT NULL DEFAULT 1,
    CONSTRAINT uq_evento_salida_1 UNIQUE (organizacion_id, id),
    CONSTRAINT uq_evento_salida_2 UNIQUE (organizacion_id, clave_idempotencia),
    CONSTRAINT ck_evento_salida_1 CHECK (version > 0),
    CONSTRAINT ck_evento_salida_2 CHECK (intentos >= 0),
    CONSTRAINT ck_evento_salida_3 CHECK (jsonb_typeof(payload) = 'object')
);

ALTER TABLE vet.usuario ADD CONSTRAINT fk_usuario_1 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.usuario ADD CONSTRAINT fk_usuario_2 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.organizacion ADD CONSTRAINT fk_organizacion_3 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.organizacion ADD CONSTRAINT fk_organizacion_4 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.sede ADD CONSTRAINT fk_sede_5 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.sede ADD CONSTRAINT fk_sede_6 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.sede ADD CONSTRAINT fk_sede_7 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.membresia ADD CONSTRAINT fk_membresia_8 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.membresia ADD CONSTRAINT fk_membresia_9 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.membresia ADD CONSTRAINT fk_membresia_10 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.membresia ADD CONSTRAINT fk_membresia_11 FOREIGN KEY (usuario_id) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.profesional ADD CONSTRAINT fk_profesional_12 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.profesional ADD CONSTRAINT fk_profesional_13 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.profesional ADD CONSTRAINT fk_profesional_14 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.profesional ADD CONSTRAINT fk_profesional_15 FOREIGN KEY (organizacion_id, membresia_id) REFERENCES vet.membresia (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.rol ADD CONSTRAINT fk_rol_16 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.rol ADD CONSTRAINT fk_rol_17 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.rol ADD CONSTRAINT fk_rol_18 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.permiso ADD CONSTRAINT fk_permiso_19 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.permiso ADD CONSTRAINT fk_permiso_20 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.rol_permiso ADD CONSTRAINT fk_rol_permiso_21 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.rol_permiso ADD CONSTRAINT fk_rol_permiso_22 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.rol_permiso ADD CONSTRAINT fk_rol_permiso_23 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.rol_permiso ADD CONSTRAINT fk_rol_permiso_24 FOREIGN KEY (organizacion_id, rol_id) REFERENCES vet.rol (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.rol_permiso ADD CONSTRAINT fk_rol_permiso_25 FOREIGN KEY (permiso_id) REFERENCES vet.permiso (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.asignacion_rol ADD CONSTRAINT fk_asignacion_rol_26 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.asignacion_rol ADD CONSTRAINT fk_asignacion_rol_27 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.asignacion_rol ADD CONSTRAINT fk_asignacion_rol_28 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.asignacion_rol ADD CONSTRAINT fk_asignacion_rol_29 FOREIGN KEY (organizacion_id, membresia_id) REFERENCES vet.membresia (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.asignacion_rol ADD CONSTRAINT fk_asignacion_rol_30 FOREIGN KEY (organizacion_id, rol_id) REFERENCES vet.rol (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.asignacion_rol ADD CONSTRAINT fk_asignacion_rol_31 FOREIGN KEY (organizacion_id, sede_id) REFERENCES vet.sede (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.archivo ADD CONSTRAINT fk_archivo_32 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.archivo ADD CONSTRAINT fk_archivo_33 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.archivo ADD CONSTRAINT fk_archivo_34 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.tutor ADD CONSTRAINT fk_tutor_35 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.tutor ADD CONSTRAINT fk_tutor_36 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.tutor ADD CONSTRAINT fk_tutor_37 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.telefono_tutor ADD CONSTRAINT fk_telefono_tutor_38 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.telefono_tutor ADD CONSTRAINT fk_telefono_tutor_39 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.telefono_tutor ADD CONSTRAINT fk_telefono_tutor_40 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.telefono_tutor ADD CONSTRAINT fk_telefono_tutor_41 FOREIGN KEY (organizacion_id, tutor_id) REFERENCES vet.tutor (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.preferencia_comunicacion ADD CONSTRAINT fk_preferencia_comunicacion_42 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.preferencia_comunicacion ADD CONSTRAINT fk_preferencia_comunicacion_43 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.preferencia_comunicacion ADD CONSTRAINT fk_preferencia_comunicacion_44 FOREIGN KEY (organizacion_id, tutor_id) REFERENCES vet.tutor (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.preferencia_comunicacion ADD CONSTRAINT fk_preferencia_comunicacion_45 FOREIGN KEY (organizacion_id, evidencia_archivo_id) REFERENCES vet.archivo (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.especie ADD CONSTRAINT fk_especie_46 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.especie ADD CONSTRAINT fk_especie_47 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.especie ADD CONSTRAINT fk_especie_48 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.raza ADD CONSTRAINT fk_raza_49 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.raza ADD CONSTRAINT fk_raza_50 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.raza ADD CONSTRAINT fk_raza_51 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.raza ADD CONSTRAINT fk_raza_52 FOREIGN KEY (organizacion_id, especie_id) REFERENCES vet.especie (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.mascota ADD CONSTRAINT fk_mascota_53 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.mascota ADD CONSTRAINT fk_mascota_54 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.mascota ADD CONSTRAINT fk_mascota_55 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.mascota ADD CONSTRAINT fk_mascota_56 FOREIGN KEY (organizacion_id, especie_id) REFERENCES vet.especie (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.mascota ADD CONSTRAINT fk_mascota_57 FOREIGN KEY (organizacion_id, especie_id, raza_id) REFERENCES vet.raza (organizacion_id, especie_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.mascota ADD CONSTRAINT fk_mascota_58 FOREIGN KEY (organizacion_id, foto_archivo_id) REFERENCES vet.archivo (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.mascota_tutor ADD CONSTRAINT fk_mascota_tutor_59 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.mascota_tutor ADD CONSTRAINT fk_mascota_tutor_60 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.mascota_tutor ADD CONSTRAINT fk_mascota_tutor_61 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.mascota_tutor ADD CONSTRAINT fk_mascota_tutor_62 FOREIGN KEY (organizacion_id, mascota_id) REFERENCES vet.mascota (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.mascota_tutor ADD CONSTRAINT fk_mascota_tutor_63 FOREIGN KEY (organizacion_id, tutor_id) REFERENCES vet.tutor (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.alerta_mascota ADD CONSTRAINT fk_alerta_mascota_64 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.alerta_mascota ADD CONSTRAINT fk_alerta_mascota_65 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.alerta_mascota ADD CONSTRAINT fk_alerta_mascota_66 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.alerta_mascota ADD CONSTRAINT fk_alerta_mascota_67 FOREIGN KEY (organizacion_id, mascota_id) REFERENCES vet.mascota (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.laboratorio ADD CONSTRAINT fk_laboratorio_68 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.laboratorio ADD CONSTRAINT fk_laboratorio_69 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.laboratorio ADD CONSTRAINT fk_laboratorio_70 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.medicamento ADD CONSTRAINT fk_medicamento_71 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.medicamento ADD CONSTRAINT fk_medicamento_72 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.medicamento ADD CONSTRAINT fk_medicamento_73 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.medicamento ADD CONSTRAINT fk_medicamento_74 FOREIGN KEY (organizacion_id, laboratorio_id) REFERENCES vet.laboratorio (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.medicamento ADD CONSTRAINT fk_medicamento_75 FOREIGN KEY (organizacion_id, foto_archivo_id) REFERENCES vet.archivo (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.vacuna ADD CONSTRAINT fk_vacuna_76 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.vacuna ADD CONSTRAINT fk_vacuna_77 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.vacuna ADD CONSTRAINT fk_vacuna_78 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.vacuna ADD CONSTRAINT fk_vacuna_79 FOREIGN KEY (organizacion_id, laboratorio_id) REFERENCES vet.laboratorio (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.vacunacion ADD CONSTRAINT fk_vacunacion_80 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.vacunacion ADD CONSTRAINT fk_vacunacion_81 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.vacunacion ADD CONSTRAINT fk_vacunacion_82 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.vacunacion ADD CONSTRAINT fk_vacunacion_83 FOREIGN KEY (organizacion_id, mascota_id) REFERENCES vet.mascota (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.vacunacion ADD CONSTRAINT fk_vacunacion_84 FOREIGN KEY (organizacion_id, sede_id) REFERENCES vet.sede (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.vacunacion ADD CONSTRAINT fk_vacunacion_85 FOREIGN KEY (organizacion_id, vacuna_id) REFERENCES vet.vacuna (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.vacunacion ADD CONSTRAINT fk_vacunacion_86 FOREIGN KEY (organizacion_id, aplicada_por) REFERENCES vet.profesional (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.vacunacion ADD CONSTRAINT fk_vacunacion_87 FOREIGN KEY (organizacion_id, mascota_id, reemplaza_id) REFERENCES vet.vacunacion (organizacion_id, mascota_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.pendiente_vacunal ADD CONSTRAINT fk_pendiente_vacunal_88 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.pendiente_vacunal ADD CONSTRAINT fk_pendiente_vacunal_89 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.pendiente_vacunal ADD CONSTRAINT fk_pendiente_vacunal_90 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.pendiente_vacunal ADD CONSTRAINT fk_pendiente_vacunal_91 FOREIGN KEY (organizacion_id, mascota_id) REFERENCES vet.mascota (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.pendiente_vacunal ADD CONSTRAINT fk_pendiente_vacunal_92 FOREIGN KEY (organizacion_id, vacuna_prevista_id) REFERENCES vet.vacuna (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.pendiente_vacunal ADD CONSTRAINT fk_pendiente_vacunal_93 FOREIGN KEY (organizacion_id, mascota_id, vacunacion_origen_id) REFERENCES vet.vacunacion (organizacion_id, mascota_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.pendiente_vacunal ADD CONSTRAINT fk_pendiente_vacunal_94 FOREIGN KEY (organizacion_id, mascota_id, vacunacion_cumplimiento_id) REFERENCES vet.vacunacion (organizacion_id, mascota_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.cita ADD CONSTRAINT fk_cita_95 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.cita ADD CONSTRAINT fk_cita_96 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.cita ADD CONSTRAINT fk_cita_97 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.cita ADD CONSTRAINT fk_cita_98 FOREIGN KEY (organizacion_id, mascota_id) REFERENCES vet.mascota (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.cita ADD CONSTRAINT fk_cita_99 FOREIGN KEY (organizacion_id, sede_id) REFERENCES vet.sede (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.cita ADD CONSTRAINT fk_cita_100 FOREIGN KEY (organizacion_id, tutor_contacto_id) REFERENCES vet.tutor (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.cita ADD CONSTRAINT fk_cita_101 FOREIGN KEY (organizacion_id, responsable_id) REFERENCES vet.membresia (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.cita ADD CONSTRAINT fk_cita_102 FOREIGN KEY (organizacion_id, mascota_id, pendiente_vacunal_id) REFERENCES vet.pendiente_vacunal (organizacion_id, mascota_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.recordatorio ADD CONSTRAINT fk_recordatorio_103 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.recordatorio ADD CONSTRAINT fk_recordatorio_104 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.recordatorio ADD CONSTRAINT fk_recordatorio_105 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.recordatorio ADD CONSTRAINT fk_recordatorio_106 FOREIGN KEY (organizacion_id, tutor_id) REFERENCES vet.tutor (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.recordatorio ADD CONSTRAINT fk_recordatorio_107 FOREIGN KEY (organizacion_id, cita_id) REFERENCES vet.cita (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.recordatorio ADD CONSTRAINT fk_recordatorio_108 FOREIGN KEY (organizacion_id, pendiente_vacunal_id) REFERENCES vet.pendiente_vacunal (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.atencion_clinica ADD CONSTRAINT fk_atencion_clinica_109 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.atencion_clinica ADD CONSTRAINT fk_atencion_clinica_110 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.atencion_clinica ADD CONSTRAINT fk_atencion_clinica_111 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.atencion_clinica ADD CONSTRAINT fk_atencion_clinica_112 FOREIGN KEY (organizacion_id, mascota_id) REFERENCES vet.mascota (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.atencion_clinica ADD CONSTRAINT fk_atencion_clinica_113 FOREIGN KEY (organizacion_id, sede_id) REFERENCES vet.sede (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.atencion_clinica ADD CONSTRAINT fk_atencion_clinica_114 FOREIGN KEY (organizacion_id, profesional_id) REFERENCES vet.profesional (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.atencion_clinica ADD CONSTRAINT fk_atencion_clinica_115 FOREIGN KEY (organizacion_id, tutor_presente_id) REFERENCES vet.tutor (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.atencion_clinica ADD CONSTRAINT fk_atencion_clinica_116 FOREIGN KEY (organizacion_id, mascota_id, sede_id, cita_id) REFERENCES vet.cita (organizacion_id, mascota_id, sede_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.revision_clinica ADD CONSTRAINT fk_revision_clinica_117 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.revision_clinica ADD CONSTRAINT fk_revision_clinica_118 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.revision_clinica ADD CONSTRAINT fk_revision_clinica_119 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.revision_clinica ADD CONSTRAINT fk_revision_clinica_120 FOREIGN KEY (organizacion_id, atencion_id) REFERENCES vet.atencion_clinica (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.revision_clinica ADD CONSTRAINT fk_revision_clinica_121 FOREIGN KEY (organizacion_id, atencion_id, revision_previa_id) REFERENCES vet.revision_clinica (organizacion_id, atencion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.revision_clinica ADD CONSTRAINT fk_revision_clinica_122 FOREIGN KEY (cerrada_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.tipo_seccion_clinica ADD CONSTRAINT fk_tipo_seccion_clinica_123 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.tipo_seccion_clinica ADD CONSTRAINT fk_tipo_seccion_clinica_124 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.tipo_seccion_clinica ADD CONSTRAINT fk_tipo_seccion_clinica_125 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.plantilla_seccion ADD CONSTRAINT fk_plantilla_seccion_126 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.plantilla_seccion ADD CONSTRAINT fk_plantilla_seccion_127 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.plantilla_seccion ADD CONSTRAINT fk_plantilla_seccion_128 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.plantilla_seccion ADD CONSTRAINT fk_plantilla_seccion_129 FOREIGN KEY (organizacion_id, tipo_seccion_id) REFERENCES vet.tipo_seccion_clinica (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.seccion_clinica ADD CONSTRAINT fk_seccion_clinica_130 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.seccion_clinica ADD CONSTRAINT fk_seccion_clinica_131 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.seccion_clinica ADD CONSTRAINT fk_seccion_clinica_132 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.seccion_clinica ADD CONSTRAINT fk_seccion_clinica_133 FOREIGN KEY (organizacion_id, revision_id) REFERENCES vet.revision_clinica (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.seccion_clinica ADD CONSTRAINT fk_seccion_clinica_134 FOREIGN KEY (organizacion_id, tipo_seccion_id, plantilla_id) REFERENCES vet.plantilla_seccion (organizacion_id, tipo_seccion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.medicion_clinica ADD CONSTRAINT fk_medicion_clinica_135 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.medicion_clinica ADD CONSTRAINT fk_medicion_clinica_136 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.medicion_clinica ADD CONSTRAINT fk_medicion_clinica_137 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.medicion_clinica ADD CONSTRAINT fk_medicion_clinica_138 FOREIGN KEY (organizacion_id, revision_id) REFERENCES vet.revision_clinica (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.diagnostico ADD CONSTRAINT fk_diagnostico_139 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.diagnostico ADD CONSTRAINT fk_diagnostico_140 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.diagnostico ADD CONSTRAINT fk_diagnostico_141 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.diagnostico_atencion ADD CONSTRAINT fk_diagnostico_atencion_142 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.diagnostico_atencion ADD CONSTRAINT fk_diagnostico_atencion_143 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.diagnostico_atencion ADD CONSTRAINT fk_diagnostico_atencion_144 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.diagnostico_atencion ADD CONSTRAINT fk_diagnostico_atencion_145 FOREIGN KEY (organizacion_id, revision_id) REFERENCES vet.revision_clinica (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.diagnostico_atencion ADD CONSTRAINT fk_diagnostico_atencion_146 FOREIGN KEY (organizacion_id, diagnostico_id) REFERENCES vet.diagnostico (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.prescripcion ADD CONSTRAINT fk_prescripcion_147 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.prescripcion ADD CONSTRAINT fk_prescripcion_148 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.prescripcion ADD CONSTRAINT fk_prescripcion_149 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.prescripcion ADD CONSTRAINT fk_prescripcion_150 FOREIGN KEY (organizacion_id, revision_id) REFERENCES vet.revision_clinica (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.prescripcion ADD CONSTRAINT fk_prescripcion_151 FOREIGN KEY (organizacion_id, profesional_id) REFERENCES vet.profesional (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.prescripcion_item ADD CONSTRAINT fk_prescripcion_item_152 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.prescripcion_item ADD CONSTRAINT fk_prescripcion_item_153 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.prescripcion_item ADD CONSTRAINT fk_prescripcion_item_154 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.prescripcion_item ADD CONSTRAINT fk_prescripcion_item_155 FOREIGN KEY (organizacion_id, prescripcion_id) REFERENCES vet.prescripcion (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.prescripcion_item ADD CONSTRAINT fk_prescripcion_item_156 FOREIGN KEY (organizacion_id, medicamento_id) REFERENCES vet.medicamento (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.tipo_servicio ADD CONSTRAINT fk_tipo_servicio_157 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.tipo_servicio ADD CONSTRAINT fk_tipo_servicio_158 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.tipo_servicio ADD CONSTRAINT fk_tipo_servicio_159 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.servicio_peluqueria ADD CONSTRAINT fk_servicio_peluqueria_160 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.servicio_peluqueria ADD CONSTRAINT fk_servicio_peluqueria_161 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.servicio_peluqueria ADD CONSTRAINT fk_servicio_peluqueria_162 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.servicio_peluqueria ADD CONSTRAINT fk_servicio_peluqueria_163 FOREIGN KEY (organizacion_id, mascota_id) REFERENCES vet.mascota (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.servicio_peluqueria ADD CONSTRAINT fk_servicio_peluqueria_164 FOREIGN KEY (organizacion_id, sede_id) REFERENCES vet.sede (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.servicio_peluqueria ADD CONSTRAINT fk_servicio_peluqueria_165 FOREIGN KEY (organizacion_id, responsable_id) REFERENCES vet.membresia (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.servicio_peluqueria ADD CONSTRAINT fk_servicio_peluqueria_166 FOREIGN KEY (organizacion_id, tutor_contacto_id) REFERENCES vet.tutor (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.servicio_peluqueria ADD CONSTRAINT fk_servicio_peluqueria_167 FOREIGN KEY (organizacion_id, mascota_id, sede_id, cita_id) REFERENCES vet.cita (organizacion_id, mascota_id, sede_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.peluqueria_item ADD CONSTRAINT fk_peluqueria_item_168 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.peluqueria_item ADD CONSTRAINT fk_peluqueria_item_169 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.peluqueria_item ADD CONSTRAINT fk_peluqueria_item_170 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.peluqueria_item ADD CONSTRAINT fk_peluqueria_item_171 FOREIGN KEY (organizacion_id, servicio_id) REFERENCES vet.servicio_peluqueria (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.peluqueria_item ADD CONSTRAINT fk_peluqueria_item_172 FOREIGN KEY (organizacion_id, tipo_servicio_id) REFERENCES vet.tipo_servicio (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.plantilla_consentimiento ADD CONSTRAINT fk_plantilla_consentimiento_173 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.plantilla_consentimiento ADD CONSTRAINT fk_plantilla_consentimiento_174 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.plantilla_consentimiento ADD CONSTRAINT fk_plantilla_consentimiento_175 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.consentimiento ADD CONSTRAINT fk_consentimiento_176 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.consentimiento ADD CONSTRAINT fk_consentimiento_177 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.consentimiento ADD CONSTRAINT fk_consentimiento_178 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.consentimiento ADD CONSTRAINT fk_consentimiento_179 FOREIGN KEY (organizacion_id, servicio_id) REFERENCES vet.servicio_peluqueria (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.consentimiento ADD CONSTRAINT fk_consentimiento_180 FOREIGN KEY (organizacion_id, plantilla_id) REFERENCES vet.plantilla_consentimiento (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.consentimiento ADD CONSTRAINT fk_consentimiento_181 FOREIGN KEY (organizacion_id, documento_archivo_id) REFERENCES vet.archivo (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.firma_consentimiento ADD CONSTRAINT fk_firma_consentimiento_182 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.firma_consentimiento ADD CONSTRAINT fk_firma_consentimiento_183 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.firma_consentimiento ADD CONSTRAINT fk_firma_consentimiento_184 FOREIGN KEY (organizacion_id, consentimiento_id, hash_documento_aceptado) REFERENCES vet.consentimiento (organizacion_id, id, hash_documento) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.firma_consentimiento ADD CONSTRAINT fk_firma_consentimiento_185 FOREIGN KEY (organizacion_id, tutor_id) REFERENCES vet.tutor (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.firma_consentimiento ADD CONSTRAINT fk_firma_consentimiento_186 FOREIGN KEY (organizacion_id, evidencia_archivo_id) REFERENCES vet.archivo (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_clinico ADD CONSTRAINT fk_adjunto_clinico_187 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_clinico ADD CONSTRAINT fk_adjunto_clinico_188 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_clinico ADD CONSTRAINT fk_adjunto_clinico_189 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_clinico ADD CONSTRAINT fk_adjunto_clinico_190 FOREIGN KEY (organizacion_id, revision_id) REFERENCES vet.revision_clinica (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_clinico ADD CONSTRAINT fk_adjunto_clinico_191 FOREIGN KEY (organizacion_id, archivo_id) REFERENCES vet.archivo (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_vacunacion ADD CONSTRAINT fk_adjunto_vacunacion_192 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_vacunacion ADD CONSTRAINT fk_adjunto_vacunacion_193 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_vacunacion ADD CONSTRAINT fk_adjunto_vacunacion_194 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_vacunacion ADD CONSTRAINT fk_adjunto_vacunacion_195 FOREIGN KEY (organizacion_id, vacunacion_id) REFERENCES vet.vacunacion (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_vacunacion ADD CONSTRAINT fk_adjunto_vacunacion_196 FOREIGN KEY (organizacion_id, archivo_id) REFERENCES vet.archivo (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_peluqueria ADD CONSTRAINT fk_adjunto_peluqueria_197 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_peluqueria ADD CONSTRAINT fk_adjunto_peluqueria_198 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_peluqueria ADD CONSTRAINT fk_adjunto_peluqueria_199 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_peluqueria ADD CONSTRAINT fk_adjunto_peluqueria_200 FOREIGN KEY (organizacion_id, servicio_id) REFERENCES vet.servicio_peluqueria (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.adjunto_peluqueria ADD CONSTRAINT fk_adjunto_peluqueria_201 FOREIGN KEY (organizacion_id, archivo_id) REFERENCES vet.archivo (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.reporte_emitido ADD CONSTRAINT fk_reporte_emitido_202 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.reporte_emitido ADD CONSTRAINT fk_reporte_emitido_203 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.reporte_emitido ADD CONSTRAINT fk_reporte_emitido_204 FOREIGN KEY (organizacion_id, mascota_id) REFERENCES vet.mascota (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.reporte_emitido ADD CONSTRAINT fk_reporte_emitido_205 FOREIGN KEY (organizacion_id, archivo_id) REFERENCES vet.archivo (organizacion_id, id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.reporte_emitido ADD CONSTRAINT fk_reporte_emitido_206 FOREIGN KEY (emitido_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.evento_auditoria ADD CONSTRAINT fk_evento_auditoria_207 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.evento_auditoria ADD CONSTRAINT fk_evento_auditoria_208 FOREIGN KEY (actor_usuario_id) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.evento_salida ADD CONSTRAINT fk_evento_salida_209 FOREIGN KEY (organizacion_id) REFERENCES vet.organizacion (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.evento_salida ADD CONSTRAINT fk_evento_salida_210 FOREIGN KEY (creado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE vet.evento_salida ADD CONSTRAINT fk_evento_salida_211 FOREIGN KEY (actualizado_por) REFERENCES vet.usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE INDEX ix_usuario_1 ON vet.usuario (creado_por);

CREATE INDEX ix_usuario_2 ON vet.usuario (actualizado_por);

CREATE INDEX ix_organizacion_1 ON vet.organizacion (creado_por);

CREATE INDEX ix_organizacion_2 ON vet.organizacion (actualizado_por);

CREATE INDEX ix_sede_1 ON vet.sede (creado_por);

CREATE INDEX ix_sede_2 ON vet.sede (actualizado_por);

CREATE INDEX ix_membresia_1 ON vet.membresia (creado_por);

CREATE INDEX ix_membresia_2 ON vet.membresia (actualizado_por);

CREATE INDEX ix_membresia_3 ON vet.membresia (usuario_id);

CREATE INDEX ix_profesional_1 ON vet.profesional (creado_por);

CREATE INDEX ix_profesional_2 ON vet.profesional (actualizado_por);

CREATE INDEX ix_rol_1 ON vet.rol (creado_por);

CREATE INDEX ix_rol_2 ON vet.rol (actualizado_por);

CREATE INDEX ix_permiso_1 ON vet.permiso (creado_por);

CREATE INDEX ix_permiso_2 ON vet.permiso (actualizado_por);

CREATE INDEX ix_rol_permiso_1 ON vet.rol_permiso (creado_por);

CREATE INDEX ix_rol_permiso_2 ON vet.rol_permiso (actualizado_por);

CREATE INDEX ix_rol_permiso_3 ON vet.rol_permiso (permiso_id);

CREATE INDEX ix_asignacion_rol_1 ON vet.asignacion_rol (creado_por);

CREATE INDEX ix_asignacion_rol_2 ON vet.asignacion_rol (actualizado_por);

CREATE INDEX ix_asignacion_rol_3 ON vet.asignacion_rol (organizacion_id, membresia_id);

CREATE INDEX ix_asignacion_rol_4 ON vet.asignacion_rol (organizacion_id, rol_id);

CREATE INDEX ix_asignacion_rol_5 ON vet.asignacion_rol (organizacion_id, sede_id);

CREATE INDEX ix_archivo_1 ON vet.archivo (creado_por);

CREATE INDEX ix_archivo_2 ON vet.archivo (actualizado_por);

CREATE INDEX ix_tutor_1 ON vet.tutor (creado_por);

CREATE INDEX ix_tutor_2 ON vet.tutor (actualizado_por);

CREATE INDEX ix_telefono_tutor_1 ON vet.telefono_tutor (creado_por);

CREATE INDEX ix_telefono_tutor_2 ON vet.telefono_tutor (actualizado_por);

CREATE INDEX ix_preferencia_comunicacion_1 ON vet.preferencia_comunicacion (creado_por);

CREATE INDEX ix_preferencia_comunicacion_2 ON vet.preferencia_comunicacion (organizacion_id, tutor_id);

CREATE INDEX ix_preferencia_comunicacion_3 ON vet.preferencia_comunicacion (organizacion_id, evidencia_archivo_id);

CREATE INDEX ix_especie_1 ON vet.especie (creado_por);

CREATE INDEX ix_especie_2 ON vet.especie (actualizado_por);

CREATE INDEX ix_raza_1 ON vet.raza (creado_por);

CREATE INDEX ix_raza_2 ON vet.raza (actualizado_por);

CREATE INDEX ix_mascota_1 ON vet.mascota (creado_por);

CREATE INDEX ix_mascota_2 ON vet.mascota (actualizado_por);

CREATE INDEX ix_mascota_3 ON vet.mascota (organizacion_id, especie_id);

CREATE INDEX ix_mascota_4 ON vet.mascota (organizacion_id, especie_id, raza_id);

CREATE INDEX ix_mascota_5 ON vet.mascota (organizacion_id, foto_archivo_id);

CREATE INDEX ix_mascota_tutor_1 ON vet.mascota_tutor (creado_por);

CREATE INDEX ix_mascota_tutor_2 ON vet.mascota_tutor (actualizado_por);

CREATE INDEX ix_mascota_tutor_3 ON vet.mascota_tutor (organizacion_id, mascota_id);

CREATE INDEX ix_mascota_tutor_4 ON vet.mascota_tutor (organizacion_id, tutor_id);

CREATE INDEX ix_alerta_mascota_1 ON vet.alerta_mascota (creado_por);

CREATE INDEX ix_alerta_mascota_2 ON vet.alerta_mascota (actualizado_por);

CREATE INDEX ix_alerta_mascota_3 ON vet.alerta_mascota (organizacion_id, mascota_id);

CREATE INDEX ix_laboratorio_1 ON vet.laboratorio (creado_por);

CREATE INDEX ix_laboratorio_2 ON vet.laboratorio (actualizado_por);

CREATE INDEX ix_medicamento_1 ON vet.medicamento (creado_por);

CREATE INDEX ix_medicamento_2 ON vet.medicamento (actualizado_por);

CREATE INDEX ix_medicamento_3 ON vet.medicamento (organizacion_id, laboratorio_id);

CREATE INDEX ix_medicamento_4 ON vet.medicamento (organizacion_id, foto_archivo_id);

CREATE INDEX ix_vacuna_1 ON vet.vacuna (creado_por);

CREATE INDEX ix_vacuna_2 ON vet.vacuna (actualizado_por);

CREATE INDEX ix_vacuna_3 ON vet.vacuna (organizacion_id, laboratorio_id);

CREATE INDEX ix_vacunacion_1 ON vet.vacunacion (organizacion_id, mascota_id, aplicada_en, id);

CREATE INDEX ix_vacunacion_2 ON vet.vacunacion (creado_por);

CREATE INDEX ix_vacunacion_3 ON vet.vacunacion (actualizado_por);

CREATE INDEX ix_vacunacion_4 ON vet.vacunacion (organizacion_id, sede_id);

CREATE INDEX ix_vacunacion_5 ON vet.vacunacion (organizacion_id, vacuna_id);

CREATE INDEX ix_vacunacion_6 ON vet.vacunacion (organizacion_id, aplicada_por);

CREATE INDEX ix_vacunacion_7 ON vet.vacunacion (organizacion_id, mascota_id, reemplaza_id);

CREATE INDEX ix_pendiente_vacunal_1 ON vet.pendiente_vacunal (organizacion_id, estado, fecha_objetivo);

CREATE INDEX ix_pendiente_vacunal_2 ON vet.pendiente_vacunal (creado_por);

CREATE INDEX ix_pendiente_vacunal_3 ON vet.pendiente_vacunal (actualizado_por);

CREATE INDEX ix_pendiente_vacunal_4 ON vet.pendiente_vacunal (organizacion_id, vacuna_prevista_id);

CREATE INDEX ix_pendiente_vacunal_5 ON vet.pendiente_vacunal (organizacion_id, mascota_id, vacunacion_origen_id);

CREATE INDEX ix_pendiente_vacunal_6 ON vet.pendiente_vacunal (organizacion_id, mascota_id, vacunacion_cumplimiento_id);

CREATE INDEX ix_cita_1 ON vet.cita (organizacion_id, sede_id, inicio);

CREATE INDEX ix_cita_2 ON vet.cita (creado_por);

CREATE INDEX ix_cita_3 ON vet.cita (actualizado_por);

CREATE INDEX ix_cita_4 ON vet.cita (organizacion_id, tutor_contacto_id);

CREATE INDEX ix_cita_5 ON vet.cita (organizacion_id, responsable_id);

CREATE INDEX ix_cita_6 ON vet.cita (organizacion_id, mascota_id, pendiente_vacunal_id);

CREATE INDEX ix_recordatorio_1 ON vet.recordatorio (organizacion_id, estado, programado_en);

CREATE INDEX ix_recordatorio_2 ON vet.recordatorio (creado_por);

CREATE INDEX ix_recordatorio_3 ON vet.recordatorio (actualizado_por);

CREATE INDEX ix_recordatorio_4 ON vet.recordatorio (organizacion_id, tutor_id);

CREATE INDEX ix_recordatorio_5 ON vet.recordatorio (organizacion_id, cita_id);

CREATE INDEX ix_recordatorio_6 ON vet.recordatorio (organizacion_id, pendiente_vacunal_id);

CREATE INDEX ix_atencion_clinica_1 ON vet.atencion_clinica (organizacion_id, mascota_id, fecha_atencion, id);

CREATE INDEX ix_atencion_clinica_2 ON vet.atencion_clinica (creado_por);

CREATE INDEX ix_atencion_clinica_3 ON vet.atencion_clinica (actualizado_por);

CREATE INDEX ix_atencion_clinica_4 ON vet.atencion_clinica (organizacion_id, sede_id);

CREATE INDEX ix_atencion_clinica_5 ON vet.atencion_clinica (organizacion_id, profesional_id);

CREATE INDEX ix_atencion_clinica_6 ON vet.atencion_clinica (organizacion_id, tutor_presente_id);

CREATE INDEX ix_atencion_clinica_7 ON vet.atencion_clinica (organizacion_id, mascota_id, sede_id, cita_id);

CREATE INDEX ix_revision_clinica_1 ON vet.revision_clinica (creado_por);

CREATE INDEX ix_revision_clinica_2 ON vet.revision_clinica (actualizado_por);

CREATE INDEX ix_revision_clinica_3 ON vet.revision_clinica (organizacion_id, atencion_id, revision_previa_id);

CREATE INDEX ix_revision_clinica_4 ON vet.revision_clinica (cerrada_por);

CREATE INDEX ix_tipo_seccion_clinica_1 ON vet.tipo_seccion_clinica (creado_por);

CREATE INDEX ix_tipo_seccion_clinica_2 ON vet.tipo_seccion_clinica (actualizado_por);

CREATE INDEX ix_plantilla_seccion_1 ON vet.plantilla_seccion (creado_por);

CREATE INDEX ix_plantilla_seccion_2 ON vet.plantilla_seccion (actualizado_por);

CREATE INDEX ix_seccion_clinica_1 ON vet.seccion_clinica (creado_por);

CREATE INDEX ix_seccion_clinica_2 ON vet.seccion_clinica (actualizado_por);

CREATE INDEX ix_seccion_clinica_3 ON vet.seccion_clinica (organizacion_id, tipo_seccion_id, plantilla_id);

CREATE INDEX ix_medicion_clinica_1 ON vet.medicion_clinica (creado_por);

CREATE INDEX ix_medicion_clinica_2 ON vet.medicion_clinica (actualizado_por);

CREATE INDEX ix_medicion_clinica_3 ON vet.medicion_clinica (organizacion_id, revision_id);

CREATE INDEX ix_diagnostico_1 ON vet.diagnostico (creado_por);

CREATE INDEX ix_diagnostico_2 ON vet.diagnostico (actualizado_por);

CREATE INDEX ix_diagnostico_atencion_1 ON vet.diagnostico_atencion (creado_por);

CREATE INDEX ix_diagnostico_atencion_2 ON vet.diagnostico_atencion (actualizado_por);

CREATE INDEX ix_diagnostico_atencion_3 ON vet.diagnostico_atencion (organizacion_id, diagnostico_id);

CREATE INDEX ix_prescripcion_1 ON vet.prescripcion (creado_por);

CREATE INDEX ix_prescripcion_2 ON vet.prescripcion (actualizado_por);

CREATE INDEX ix_prescripcion_3 ON vet.prescripcion (organizacion_id, revision_id);

CREATE INDEX ix_prescripcion_4 ON vet.prescripcion (organizacion_id, profesional_id);

CREATE INDEX ix_prescripcion_item_1 ON vet.prescripcion_item (creado_por);

CREATE INDEX ix_prescripcion_item_2 ON vet.prescripcion_item (actualizado_por);

CREATE INDEX ix_prescripcion_item_3 ON vet.prescripcion_item (organizacion_id, prescripcion_id);

CREATE INDEX ix_prescripcion_item_4 ON vet.prescripcion_item (organizacion_id, medicamento_id);

CREATE INDEX ix_tipo_servicio_1 ON vet.tipo_servicio (creado_por);

CREATE INDEX ix_tipo_servicio_2 ON vet.tipo_servicio (actualizado_por);

CREATE INDEX ix_servicio_peluqueria_1 ON vet.servicio_peluqueria (organizacion_id, mascota_id, fecha_servicio, id);

CREATE INDEX ix_servicio_peluqueria_2 ON vet.servicio_peluqueria (creado_por);

CREATE INDEX ix_servicio_peluqueria_3 ON vet.servicio_peluqueria (actualizado_por);

CREATE INDEX ix_servicio_peluqueria_4 ON vet.servicio_peluqueria (organizacion_id, sede_id);

CREATE INDEX ix_servicio_peluqueria_5 ON vet.servicio_peluqueria (organizacion_id, responsable_id);

CREATE INDEX ix_servicio_peluqueria_6 ON vet.servicio_peluqueria (organizacion_id, tutor_contacto_id);

CREATE INDEX ix_servicio_peluqueria_7 ON vet.servicio_peluqueria (organizacion_id, mascota_id, sede_id, cita_id);

CREATE INDEX ix_peluqueria_item_1 ON vet.peluqueria_item (creado_por);

CREATE INDEX ix_peluqueria_item_2 ON vet.peluqueria_item (actualizado_por);

CREATE INDEX ix_peluqueria_item_3 ON vet.peluqueria_item (organizacion_id, tipo_servicio_id);

CREATE INDEX ix_plantilla_consentimiento_1 ON vet.plantilla_consentimiento (creado_por);

CREATE INDEX ix_plantilla_consentimiento_2 ON vet.plantilla_consentimiento (actualizado_por);

CREATE INDEX ix_consentimiento_1 ON vet.consentimiento (creado_por);

CREATE INDEX ix_consentimiento_2 ON vet.consentimiento (actualizado_por);

CREATE INDEX ix_consentimiento_3 ON vet.consentimiento (organizacion_id, servicio_id);

CREATE INDEX ix_consentimiento_4 ON vet.consentimiento (organizacion_id, plantilla_id);

CREATE INDEX ix_consentimiento_5 ON vet.consentimiento (organizacion_id, documento_archivo_id);

CREATE INDEX ix_firma_consentimiento_1 ON vet.firma_consentimiento (creado_por);

CREATE INDEX ix_firma_consentimiento_2 ON vet.firma_consentimiento (organizacion_id, consentimiento_id, hash_documento_aceptado);

CREATE INDEX ix_firma_consentimiento_3 ON vet.firma_consentimiento (organizacion_id, tutor_id);

CREATE INDEX ix_firma_consentimiento_4 ON vet.firma_consentimiento (organizacion_id, evidencia_archivo_id);

CREATE INDEX ix_adjunto_clinico_1 ON vet.adjunto_clinico (creado_por);

CREATE INDEX ix_adjunto_clinico_2 ON vet.adjunto_clinico (actualizado_por);

CREATE INDEX ix_adjunto_clinico_3 ON vet.adjunto_clinico (organizacion_id, archivo_id);

CREATE INDEX ix_adjunto_vacunacion_1 ON vet.adjunto_vacunacion (creado_por);

CREATE INDEX ix_adjunto_vacunacion_2 ON vet.adjunto_vacunacion (actualizado_por);

CREATE INDEX ix_adjunto_vacunacion_3 ON vet.adjunto_vacunacion (organizacion_id, archivo_id);

CREATE INDEX ix_adjunto_peluqueria_1 ON vet.adjunto_peluqueria (creado_por);

CREATE INDEX ix_adjunto_peluqueria_2 ON vet.adjunto_peluqueria (actualizado_por);

CREATE INDEX ix_adjunto_peluqueria_3 ON vet.adjunto_peluqueria (organizacion_id, archivo_id);

CREATE INDEX ix_reporte_emitido_1 ON vet.reporte_emitido (creado_por);

CREATE INDEX ix_reporte_emitido_2 ON vet.reporte_emitido (organizacion_id, mascota_id);

CREATE INDEX ix_reporte_emitido_3 ON vet.reporte_emitido (organizacion_id, archivo_id);

CREATE INDEX ix_reporte_emitido_4 ON vet.reporte_emitido (emitido_por);

CREATE INDEX ix_evento_auditoria_1 ON vet.evento_auditoria (organizacion_id, entidad, registro_id, ocurrido_en);

CREATE INDEX ix_evento_auditoria_2 ON vet.evento_auditoria (actor_usuario_id);

CREATE INDEX ix_evento_salida_1 ON vet.evento_salida (creado_por);

CREATE INDEX ix_evento_salida_2 ON vet.evento_salida (actualizado_por);

CREATE UNIQUE INDEX ix_parcial_asignacion_rol_1 ON vet.asignacion_rol (organizacion_id,membresia_id,rol_id) WHERE sede_id IS NULL;

CREATE UNIQUE INDEX ix_parcial_asignacion_rol_2 ON vet.asignacion_rol (organizacion_id,membresia_id,rol_id,sede_id) WHERE sede_id IS NOT NULL;

CREATE UNIQUE INDEX ix_parcial_telefono_tutor_3 ON vet.telefono_tutor (organizacion_id,tutor_id) WHERE principal;

CREATE UNIQUE INDEX ix_parcial_mascota_tutor_4 ON vet.mascota_tutor (organizacion_id,mascota_id) WHERE es_principal AND vigente_hasta IS NULL;

CREATE UNIQUE INDEX ix_parcial_mascota_tutor_5 ON vet.mascota_tutor (organizacion_id,mascota_id,tutor_id) WHERE vigente_hasta IS NULL;

CREATE UNIQUE INDEX ix_parcial_cita_6 ON vet.cita (organizacion_id,pendiente_vacunal_id) WHERE pendiente_vacunal_id IS NOT NULL AND estado IN ('programada','confirmada','en_atencion');

CREATE UNIQUE INDEX ix_parcial_revision_clinica_7 ON vet.revision_clinica (organizacion_id,atencion_id) WHERE estado = 'borrador';

CREATE INDEX ix_parcial_evento_salida_8 ON vet.evento_salida (organizacion_id,creado_en) WHERE procesado_en IS NULL;

-- Este fragmento se incorpora en 01_schema.sql al ejecutar generate.py.
-- El backend autentica, autoriza y establece app.usuario_id / app.organizacion_id
-- mediante set_config(..., true) dentro de CADA transaccion.

CREATE FUNCTION vet.actualizar_metadata() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, vet AS $$
DECLARE actor uuid := nullif(current_setting('app.usuario_id', true), '')::uuid;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.id <> OLD.id OR
       ((to_jsonb(NEW)->>'organizacion_id') IS DISTINCT FROM (to_jsonb(OLD)->>'organizacion_id')) THEN
      RAISE EXCEPTION 'No se permite cambiar identificadores u organizacion';
    END IF;
    NEW.creado_en := OLD.creado_en;
    NEW.creado_por := OLD.creado_por;
    NEW.version := OLD.version + 1;
  ELSE
    NEW.creado_por := coalesce(actor, NEW.creado_por);
    NEW.version := 1;
  END IF;
  NEW.actualizado_en := clock_timestamp();
  NEW.actualizado_por := coalesce(actor, NEW.actualizado_por);
  RETURN NEW;
END $$;

CREATE FUNCTION vet.auditar_cambio() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, vet AS $$
DECLARE registro jsonb; anterior jsonb; campos jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN registro := to_jsonb(OLD);
  ELSE registro := to_jsonb(NEW); END IF;
  anterior := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE '{}'::jsonb END;
  SELECT coalesce(jsonb_agg(k ORDER BY k), '[]'::jsonb) INTO campos
  FROM jsonb_object_keys(registro) AS x(k)
  WHERE k NOT IN ('actualizado_en','actualizado_por','version')
    AND (TG_OP <> 'UPDATE' OR registro->k IS DISTINCT FROM anterior->k);
  INSERT INTO vet.evento_auditoria
    (organizacion_id, actor_usuario_id, actor_servicio, accion, entidad,
     registro_id, campos_modificados, motivo, request_id)
  VALUES
    ((registro->>'organizacion_id')::uuid,
     nullif(current_setting('app.usuario_id', true),'')::uuid,
     coalesce(nullif(current_setting('app.servicio', true),''), session_user),
     TG_OP, TG_TABLE_NAME, (registro->>'id')::uuid, campos,
     nullif(current_setting('app.motivo', true),''),
     nullif(current_setting('app.request_id', true),'')::uuid);
  RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION vet.auditar_cambio() FROM PUBLIC;

CREATE FUNCTION vet.impedir_mutacion() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Registro inmutable en %. Cree otro registro para corregir o revocar', TG_TABLE_NAME;
END $$;
CREATE TRIGGER a_inmutable BEFORE UPDATE OR DELETE ON vet.evento_auditoria FOR EACH ROW EXECUTE FUNCTION vet.impedir_mutacion();
CREATE TRIGGER a_inmutable BEFORE UPDATE OR DELETE ON vet.firma_consentimiento FOR EACH ROW EXECUTE FUNCTION vet.impedir_mutacion();
CREATE TRIGGER a_inmutable BEFORE UPDATE OR DELETE ON vet.reporte_emitido FOR EACH ROW EXECUTE FUNCTION vet.impedir_mutacion();
CREATE TRIGGER a_inmutable BEFORE UPDATE OR DELETE ON vet.preferencia_comunicacion FOR EACH ROW EXECUTE FUNCTION vet.impedir_mutacion();

CREATE FUNCTION vet.proteger_publicado() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.publicada_en IS NOT NULL THEN
    RAISE EXCEPTION 'Plantilla publicada inmutable; cree una nueva version';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER a_publicada BEFORE UPDATE OR DELETE ON vet.plantilla_seccion FOR EACH ROW EXECUTE FUNCTION vet.proteger_publicado();
CREATE TRIGGER a_publicada BEFORE UPDATE OR DELETE ON vet.plantilla_consentimiento FOR EACH ROW EXECUTE FUNCTION vet.proteger_publicado();

CREATE FUNCTION vet.proteger_revision() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, vet AS $$
DECLARE previa vet.revision_clinica;
BEGIN
  IF TG_OP <> 'INSERT' AND OLD.estado = 'cerrada' THEN
    RAISE EXCEPTION 'Historia cerrada inmutable. Cree una revision con motivo';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  PERFORM 1 FROM vet.atencion_clinica
    WHERE organizacion_id=NEW.organizacion_id AND id=NEW.atencion_id FOR UPDATE;
  IF TG_OP = 'UPDATE' AND (NEW.atencion_id <> OLD.atencion_id OR NEW.numero <> OLD.numero OR NEW.revision_previa_id IS DISTINCT FROM OLD.revision_previa_id) THEN
    RAISE EXCEPTION 'No se permite cambiar la identidad de una revision';
  END IF;
  IF NEW.revision_previa_id IS NOT NULL THEN
    SELECT * INTO previa FROM vet.revision_clinica
    WHERE organizacion_id = NEW.organizacion_id AND id = NEW.revision_previa_id;
    IF NOT FOUND OR previa.estado <> 'cerrada' OR NEW.numero <> previa.numero + 1 THEN
      RAISE EXCEPTION 'La revision previa debe estar cerrada y la numeracion ser consecutiva';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER a_revision BEFORE INSERT OR UPDATE OR DELETE ON vet.revision_clinica FOR EACH ROW EXECUTE FUNCTION vet.proteger_revision();

CREATE FUNCTION vet.proteger_detalle_clinico() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, vet AS $$
DECLARE registro jsonb; rid uuid; org uuid; estado_revision text; parent_col text;
BEGIN
  registro := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
  org := (registro->>'organizacion_id')::uuid;
  parent_col := CASE WHEN TG_TABLE_NAME = 'prescripcion_item' THEN 'prescripcion_id' ELSE 'revision_id' END;
  IF TG_OP = 'UPDATE' AND ((to_jsonb(OLD)->>parent_col) IS DISTINCT FROM (registro->>parent_col)) THEN
    RAISE EXCEPTION 'No se permite trasladar detalles entre registros clinicos';
  END IF;
  IF TG_TABLE_NAME = 'prescripcion_item' THEN
    SELECT revision_id INTO rid FROM vet.prescripcion
      WHERE organizacion_id = org AND id = (registro->>'prescripcion_id')::uuid FOR UPDATE;
  ELSE rid := (registro->>'revision_id')::uuid; END IF;
  SELECT estado INTO estado_revision FROM vet.revision_clinica
    WHERE organizacion_id = org AND id = rid FOR UPDATE;
  IF estado_revision IS DISTINCT FROM 'borrador' THEN
    RAISE EXCEPTION 'Solo se pueden modificar detalles de una revision en borrador';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER a_detalle BEFORE INSERT OR UPDATE OR DELETE ON vet.seccion_clinica FOR EACH ROW EXECUTE FUNCTION vet.proteger_detalle_clinico();
CREATE TRIGGER a_detalle BEFORE INSERT OR UPDATE OR DELETE ON vet.medicion_clinica FOR EACH ROW EXECUTE FUNCTION vet.proteger_detalle_clinico();
CREATE TRIGGER a_detalle BEFORE INSERT OR UPDATE OR DELETE ON vet.diagnostico_atencion FOR EACH ROW EXECUTE FUNCTION vet.proteger_detalle_clinico();
CREATE TRIGGER a_detalle BEFORE INSERT OR UPDATE OR DELETE ON vet.prescripcion FOR EACH ROW EXECUTE FUNCTION vet.proteger_detalle_clinico();
CREATE TRIGGER a_detalle BEFORE INSERT OR UPDATE OR DELETE ON vet.prescripcion_item FOR EACH ROW EXECUTE FUNCTION vet.proteger_detalle_clinico();
CREATE TRIGGER a_detalle BEFORE INSERT OR UPDATE OR DELETE ON vet.adjunto_clinico FOR EACH ROW EXECUTE FUNCTION vet.proteger_detalle_clinico();

-- Protege los datos identificadores de una atencion si ya tiene versiones cerradas.
CREATE FUNCTION vet.proteger_atencion() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, vet AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM vet.revision_clinica WHERE organizacion_id=OLD.organizacion_id AND atencion_id=OLD.id AND estado='cerrada') THEN
    IF TG_OP='DELETE' OR
       (to_jsonb(NEW) - ARRAY['estado','motivo_anulacion','actualizado_en','actualizado_por','version']) IS DISTINCT FROM
       (to_jsonb(OLD) - ARRAY['estado','motivo_anulacion','actualizado_en','actualizado_por','version']) THEN
      RAISE EXCEPTION 'La atencion tiene historia cerrada; sus datos originales son inmutables';
    END IF;
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER a_atencion BEFORE UPDATE OR DELETE ON vet.atencion_clinica FOR EACH ROW EXECUTE FUNCTION vet.proteger_atencion();

CREATE FUNCTION vet.proteger_vacunacion() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Anule la vacunacion con motivo; no la elimine'; END IF;
  IF OLD.estado = 'anulada' OR NEW.estado <> 'anulada' OR
     (to_jsonb(NEW) - ARRAY['estado','motivo_anulacion','actualizado_en','actualizado_por','version']) IS DISTINCT FROM
     (to_jsonb(OLD) - ARRAY['estado','motivo_anulacion','actualizado_en','actualizado_por','version']) THEN
    RAISE EXCEPTION 'Solo se permite anular una vacunacion; la correccion se registra en otra fila';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER a_vacunacion BEFORE UPDATE OR DELETE ON vet.vacunacion FOR EACH ROW EXECUTE FUNCTION vet.proteger_vacunacion();

-- Un archivo disponible representa bytes inmutables. Migraciones de almacenamiento
-- requieren procedimiento administrativo; nunca sobrescribir el archivo original.
CREATE FUNCTION vet.proteger_archivo() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.estado_analisis = 'disponible' THEN
    RAISE EXCEPTION 'Archivo disponible inmutable; registre otra version como nuevo archivo';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER a_archivo BEFORE UPDATE OR DELETE ON vet.archivo FOR EACH ROW EXECUTE FUNCTION vet.proteger_archivo();

-- Verifica exactamente un tutor principal abierto AL FINAL de la transaccion.
CREATE FUNCTION vet.verificar_tutor_principal() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, vet AS $$
DECLARE mid uuid; org uuid;
BEGIN
  IF TG_TABLE_NAME = 'mascota' THEN mid := NEW.id; org := NEW.organizacion_id;
  ELSIF TG_OP='DELETE' THEN mid := OLD.mascota_id; org := OLD.organizacion_id;
  ELSE mid := NEW.mascota_id; org := NEW.organizacion_id; END IF;
  PERFORM 1 FROM vet.mascota WHERE id=mid AND organizacion_id=org FOR UPDATE;
  IF FOUND AND (SELECT count(*) FROM vet.mascota_tutor
     WHERE organizacion_id=org AND mascota_id=mid AND es_principal AND vigente_hasta IS NULL) <> 1 THEN
    RAISE EXCEPTION 'La mascota debe tener exactamente un tutor principal abierto';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER tutor_principal_mascota AFTER INSERT ON vet.mascota
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION vet.verificar_tutor_principal();
CREATE CONSTRAINT TRIGGER tutor_principal_vinculo AFTER INSERT OR UPDATE OR DELETE ON vet.mascota_tutor
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION vet.verificar_tutor_principal();

CREATE FUNCTION vet.proteger_vinculo_tutor() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.mascota_id <> OLD.mascota_id OR NEW.tutor_id <> OLD.tutor_id OR NEW.vigente_desde <> OLD.vigente_desde THEN
    RAISE EXCEPTION 'Cierre el vinculo anterior y cree otro; no cambie sus participantes';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER a_vinculo BEFORE UPDATE ON vet.mascota_tutor FOR EACH ROW EXECUTE FUNCTION vet.proteger_vinculo_tutor();

CREATE FUNCTION vet.proteger_consentimiento() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, vet AS $$
BEGIN
  IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Conserve el consentimiento y registre su revocacion'; END IF;
  IF (to_jsonb(NEW) - ARRAY['estado','actualizado_en','actualizado_por','version']) IS DISTINCT FROM
     (to_jsonb(OLD) - ARRAY['estado','actualizado_en','actualizado_por','version']) THEN
    RAISE EXCEPTION 'El documento emitido es inmutable';
  END IF;
  IF NOT ((OLD.estado='pendiente' AND NEW.estado IN ('aceptado','rechazado')) OR
          (OLD.estado='aceptado' AND NEW.estado='revocado') OR OLD.estado=NEW.estado) THEN
    RAISE EXCEPTION 'Transicion de consentimiento invalida';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER a_consentimiento BEFORE UPDATE OR DELETE ON vet.consentimiento FOR EACH ROW EXECUTE FUNCTION vet.proteger_consentimiento();

CREATE FUNCTION vet.validar_firma() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, vet AS $$
DECLARE mid uuid; consentimiento_estado text; zona text;
BEGIN
  SELECT s.mascota_id,c.estado,sd.zona_horaria INTO mid,consentimiento_estado,zona
  FROM vet.consentimiento c JOIN vet.servicio_peluqueria s
    ON s.organizacion_id=c.organizacion_id AND s.id=c.servicio_id
  JOIN vet.sede sd ON sd.organizacion_id=s.organizacion_id AND sd.id=s.sede_id
  WHERE c.organizacion_id=NEW.organizacion_id AND c.id=NEW.consentimiento_id FOR UPDATE OF c,s;
  IF consentimiento_estado IS DISTINCT FROM 'pendiente' THEN
    RAISE EXCEPTION 'Solo se puede firmar un consentimiento pendiente';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vet.mascota_tutor WHERE organizacion_id=NEW.organizacion_id
      AND mascota_id=mid AND tutor_id=NEW.tutor_id AND autorizado_consentir
      AND vigente_desde <= (NEW.firmado_en AT TIME ZONE zona)::date
      AND (vigente_hasta IS NULL OR vigente_hasta > (NEW.firmado_en AT TIME ZONE zona)::date)) THEN
    RAISE EXCEPTION 'El tutor no tiene autorizacion vigente para consentir';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER a_firma BEFORE INSERT ON vet.firma_consentimiento FOR EACH ROW EXECUTE FUNCTION vet.validar_firma();

CREATE FUNCTION vet.verificar_aceptacion() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, vet AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM vet.consentimiento c WHERE c.id=NEW.id AND c.organizacion_id=NEW.organizacion_id
    AND c.estado='aceptado' AND NOT EXISTS (SELECT 1 FROM vet.firma_consentimiento f
      WHERE f.organizacion_id=c.organizacion_id AND f.consentimiento_id=c.id)) THEN
    RAISE EXCEPTION 'Consentimiento aceptado sin evidencia de firma';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER consentimiento_firmado AFTER INSERT OR UPDATE ON vet.consentimiento
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION vet.verificar_aceptacion();

CREATE FUNCTION vet.validar_inicio_peluqueria() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, vet AS $$
BEGIN
  IF NEW.estado IN ('en_servicio','finalizado','entregado') AND NEW.requiere_consentimiento THEN
    IF NOT EXISTS (SELECT 1 FROM vet.consentimiento c JOIN vet.firma_consentimiento f
       ON f.organizacion_id=c.organizacion_id AND f.consentimiento_id=c.id
       WHERE c.organizacion_id=NEW.organizacion_id AND c.servicio_id=NEW.id AND c.estado='aceptado') THEN
      RAISE EXCEPTION 'Se requiere consentimiento aceptado y firmado antes del servicio';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER a_inicio BEFORE INSERT OR UPDATE ON vet.servicio_peluqueria FOR EACH ROW EXECUTE FUNCTION vet.validar_inicio_peluqueria();

-- Vista cronologica: las reglas RLS se aplican con los permisos del invocador.
CREATE VIEW vet.historial_mascota WITH (security_invoker=true) AS
SELECT organizacion_id,mascota_id,id AS registro_id,'clinica'::text AS tipo,fecha_atencion AS fecha,estado FROM vet.atencion_clinica
UNION ALL
SELECT organizacion_id,mascota_id,id,'vacunacion',aplicada_en,estado FROM vet.vacunacion
UNION ALL
SELECT p.organizacion_id,p.mascota_id,p.id,'peluqueria',
       coalesce(p.llegada_en,p.fecha_servicio::timestamp AT TIME ZONE s.zona_horaria),p.estado
FROM vet.servicio_peluqueria p JOIN vet.sede s ON s.organizacion_id=p.organizacion_id AND s.id=p.sede_id;


CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.usuario FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.organizacion FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.sede FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.sede FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.sede ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.sede USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.membresia FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.membresia FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.membresia ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.membresia USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.profesional FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.profesional FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.profesional ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.profesional USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.rol FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.rol FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.rol ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.rol USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.permiso FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.rol_permiso FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.rol_permiso FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.rol_permiso ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.rol_permiso USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.asignacion_rol FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.asignacion_rol FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.asignacion_rol ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.asignacion_rol USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.archivo FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.archivo FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.archivo ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.archivo USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.tutor FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.tutor FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.tutor ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.tutor USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.telefono_tutor FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.telefono_tutor FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.telefono_tutor ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.telefono_tutor USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.preferencia_comunicacion FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.preferencia_comunicacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.preferencia_comunicacion USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.especie FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.especie FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.especie ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.especie USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.raza FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.raza FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.raza ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.raza USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.mascota FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.mascota FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.mascota ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.mascota USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.mascota_tutor FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.mascota_tutor FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.mascota_tutor ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.mascota_tutor USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.alerta_mascota FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.alerta_mascota FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.alerta_mascota ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.alerta_mascota USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.laboratorio FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.laboratorio FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.laboratorio ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.laboratorio USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.medicamento FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.medicamento FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.medicamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.medicamento USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.vacuna FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.vacuna FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.vacuna ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.vacuna USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.vacunacion FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.vacunacion FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.vacunacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.vacunacion USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.pendiente_vacunal FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.pendiente_vacunal FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.pendiente_vacunal ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.pendiente_vacunal USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.cita FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.cita FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.cita ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.cita USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.recordatorio FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.recordatorio FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.recordatorio ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.recordatorio USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.atencion_clinica FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.atencion_clinica FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.atencion_clinica ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.atencion_clinica USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.revision_clinica FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.revision_clinica FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.revision_clinica ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.revision_clinica USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.tipo_seccion_clinica FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.tipo_seccion_clinica FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.tipo_seccion_clinica ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.tipo_seccion_clinica USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.plantilla_seccion FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.plantilla_seccion FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.plantilla_seccion ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.plantilla_seccion USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.seccion_clinica FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.seccion_clinica FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.seccion_clinica ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.seccion_clinica USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.medicion_clinica FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.medicion_clinica FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.medicion_clinica ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.medicion_clinica USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.diagnostico FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.diagnostico FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.diagnostico ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.diagnostico USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.diagnostico_atencion FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.diagnostico_atencion FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.diagnostico_atencion ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.diagnostico_atencion USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.prescripcion FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.prescripcion FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.prescripcion ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.prescripcion USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.prescripcion_item FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.prescripcion_item FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.prescripcion_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.prescripcion_item USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.tipo_servicio FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.tipo_servicio FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.tipo_servicio ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.tipo_servicio USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.servicio_peluqueria FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.servicio_peluqueria FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.servicio_peluqueria ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.servicio_peluqueria USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.peluqueria_item FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.peluqueria_item FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.peluqueria_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.peluqueria_item USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.plantilla_consentimiento FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.plantilla_consentimiento FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.plantilla_consentimiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.plantilla_consentimiento USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.consentimiento FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.consentimiento FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.consentimiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.consentimiento USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.firma_consentimiento FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.firma_consentimiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.firma_consentimiento USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.adjunto_clinico FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.adjunto_clinico FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.adjunto_clinico ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.adjunto_clinico USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.adjunto_vacunacion FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.adjunto_vacunacion FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.adjunto_vacunacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.adjunto_vacunacion USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.adjunto_peluqueria FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.adjunto_peluqueria FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.adjunto_peluqueria ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.adjunto_peluqueria USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.reporte_emitido FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.reporte_emitido ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.reporte_emitido USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

ALTER TABLE vet.evento_auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.evento_auditoria USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);

CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.evento_salida FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();

CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE OR DELETE ON vet.evento_salida FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();

ALTER TABLE vet.evento_salida ENABLE ROW LEVEL SECURITY;

CREATE POLICY aislamiento_organizacion ON vet.evento_salida USING (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid) WITH CHECK (organizacion_id = nullif(current_setting('app.organizacion_id', true), '')::uuid);
