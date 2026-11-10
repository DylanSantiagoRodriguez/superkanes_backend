import { MigrationInterface, QueryRunner } from 'typeorm';
export class ClinicalConsent1794318000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`
      ALTER TABLE vet.consentimiento ALTER COLUMN servicio_id DROP NOT NULL;
      ALTER TABLE vet.consentimiento ADD COLUMN atencion_id uuid,
        ADD COLUMN procedimiento text, ADD COLUMN alcance text,
        ADD CONSTRAINT fk_consentimiento_atencion FOREIGN KEY(organizacion_id,atencion_id) REFERENCES vet.atencion_clinica(organizacion_id,id),
        ADD CONSTRAINT ck_consentimiento_destino CHECK(num_nonnulls(servicio_id,atencion_id)=1),
        ADD CONSTRAINT ck_consentimiento_procedimiento CHECK(atencion_id IS NULL OR nullif(btrim(procedimiento),'') IS NOT NULL);
      CREATE INDEX ix_consentimiento_atencion ON vet.consentimiento(organizacion_id,atencion_id);
      ALTER TABLE vet.firma_consentimiento ADD COLUMN decision text NOT NULL DEFAULT 'aceptado'
        CHECK(decision IN ('aceptado','rechazado'));
      CREATE OR REPLACE FUNCTION vet.validar_firma() RETURNS trigger
      LANGUAGE plpgsql SET search_path=pg_catalog,vet AS $$
      DECLARE mid uuid; consentimiento_estado text; zona text; cid uuid; sid uuid;
      BEGIN
        SELECT c.estado,c.atencion_id,c.servicio_id INTO consentimiento_estado,cid,sid
        FROM vet.consentimiento c WHERE c.organizacion_id=NEW.organizacion_id AND c.id=NEW.consentimiento_id FOR UPDATE;
        IF consentimiento_estado IS DISTINCT FROM 'pendiente' THEN RAISE EXCEPTION 'Solo se puede responder un consentimiento pendiente'; END IF;
        IF cid IS NOT NULL THEN
          SELECT a.mascota_id,s.zona_horaria INTO mid,zona FROM vet.atencion_clinica a JOIN vet.sede s ON s.id=a.sede_id AND s.organizacion_id=a.organizacion_id
          WHERE a.organizacion_id=NEW.organizacion_id AND a.id=cid FOR UPDATE OF a;
        ELSE
          SELECT p.mascota_id,s.zona_horaria INTO mid,zona FROM vet.servicio_peluqueria p JOIN vet.sede s ON s.id=p.sede_id AND s.organizacion_id=p.organizacion_id
          WHERE p.organizacion_id=NEW.organizacion_id AND p.id=sid FOR UPDATE OF p;
        END IF;
        IF NOT EXISTS(SELECT 1 FROM vet.mascota_tutor WHERE organizacion_id=NEW.organizacion_id AND mascota_id=mid AND tutor_id=NEW.tutor_id AND autorizado_consentir
          AND vigente_desde<=(NEW.firmado_en AT TIME ZONE zona)::date AND (vigente_hasta IS NULL OR vigente_hasta>(NEW.firmado_en AT TIME ZONE zona)::date)) THEN RAISE EXCEPTION 'Tutor sin autorizacion vigente'; END IF;
        RETURN NEW;
      END $$;
      CREATE OR REPLACE FUNCTION vet.verificar_aceptacion() RETURNS trigger
      LANGUAGE plpgsql SET search_path=pg_catalog,vet AS $$
      BEGIN
        IF EXISTS(SELECT 1 FROM vet.consentimiento c WHERE c.id=NEW.id AND c.organizacion_id=NEW.organizacion_id
          AND (c.estado='aceptado' OR (c.atencion_id IS NOT NULL AND c.estado='rechazado'))
          AND NOT EXISTS(SELECT 1 FROM vet.firma_consentimiento f WHERE f.organizacion_id=c.organizacion_id AND f.consentimiento_id=c.id AND f.decision=c.estado)) THEN
          RAISE EXCEPTION 'Respuesta sin evidencia documental coherente'; END IF;
        RETURN NULL;
      END $$;
    `);
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'Conservar consentimientos clinicos; aplicar migracion correctiva.',
      ),
    );
  }
}
