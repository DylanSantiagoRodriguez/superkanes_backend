import { MigrationInterface, QueryRunner } from 'typeorm';
export class LaboratoryWorkflow1794320000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`
      CREATE TABLE vet.orden_laboratorio(
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organizacion_id uuid NOT NULL REFERENCES vet.organizacion(id),
        atencion_id uuid NOT NULL,laboratorio_id uuid NOT NULL,pruebas text NOT NULL CHECK(length(btrim(pruebas))>0),indicacion text,
        estado text NOT NULL DEFAULT 'solicitada' CHECK(estado IN('solicitada','muestra_tomada','en_proceso','resultado_disponible','revisada','comunicada','cancelada')),
        muestra text,tomada_en timestamptz,interpretacion text,revisada_en timestamptz,comunicacion text,comunicada_en timestamptz,motivo_cancelacion text,
        creado_en timestamptz NOT NULL DEFAULT now(),creado_por uuid REFERENCES vet.usuario(id),actualizado_en timestamptz NOT NULL DEFAULT now(),actualizado_por uuid REFERENCES vet.usuario(id),version integer NOT NULL DEFAULT 1 CHECK(version>0),
        UNIQUE(organizacion_id,id),FOREIGN KEY(organizacion_id,atencion_id) REFERENCES vet.atencion_clinica(organizacion_id,id),FOREIGN KEY(organizacion_id,laboratorio_id) REFERENCES vet.laboratorio(organizacion_id,id));
      CREATE TABLE vet.resultado_laboratorio(
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organizacion_id uuid NOT NULL REFERENCES vet.organizacion(id),orden_id uuid NOT NULL,
        numero integer NOT NULL CHECK(numero>0),previo_id uuid,motivo_correccion text,resultado text NOT NULL CHECK(length(btrim(resultado))>0),archivo_id uuid,
        creado_en timestamptz NOT NULL DEFAULT now(),creado_por uuid REFERENCES vet.usuario(id),
        UNIQUE(organizacion_id,id),UNIQUE(organizacion_id,orden_id,id),UNIQUE(organizacion_id,orden_id,numero),UNIQUE(organizacion_id,previo_id),
        FOREIGN KEY(organizacion_id,orden_id) REFERENCES vet.orden_laboratorio(organizacion_id,id),
        FOREIGN KEY(organizacion_id,orden_id,previo_id) REFERENCES vet.resultado_laboratorio(organizacion_id,orden_id,id),
        FOREIGN KEY(organizacion_id,archivo_id) REFERENCES vet.archivo(organizacion_id,id),
        CHECK((numero=1 AND previo_id IS NULL) OR(numero>1 AND previo_id IS NOT NULL AND nullif(btrim(motivo_correccion),'') IS NOT NULL)));

      CREATE TABLE vet.evento_orden_laboratorio(
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organizacion_id uuid NOT NULL,orden_id uuid NOT NULL,
        datos jsonb NOT NULL,creado_en timestamptz NOT NULL DEFAULT now(),creado_por uuid REFERENCES vet.usuario(id),
        FOREIGN KEY(organizacion_id,orden_id) REFERENCES vet.orden_laboratorio(organizacion_id,id));
      ALTER TABLE vet.evento_orden_laboratorio ENABLE ROW LEVEL SECURITY;
      CREATE POLICY aislamiento_organizacion ON vet.evento_orden_laboratorio USING(organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid) WITH CHECK(organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid);
      CREATE FUNCTION vet.conservar_evolucion_laboratorio() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,vet AS $$
      BEGIN
        INSERT INTO vet.evento_orden_laboratorio(organizacion_id,orden_id,datos,creado_por) VALUES(NEW.organizacion_id,NEW.id,jsonb_build_object('anterior',to_jsonb(OLD),'actual',to_jsonb(NEW)),NEW.actualizado_por);
        RETURN NULL;
      END $$;
      CREATE TRIGGER zy_evolucion AFTER UPDATE ON vet.orden_laboratorio FOR EACH ROW EXECUTE FUNCTION vet.conservar_evolucion_laboratorio();
      CREATE TRIGGER a_inmutable BEFORE UPDATE OR DELETE ON vet.evento_orden_laboratorio FOR EACH ROW EXECUTE FUNCTION vet.impedir_mutacion();
      CREATE INDEX ix_evento_laboratorio_orden ON vet.evento_orden_laboratorio(organizacion_id,orden_id,creado_en);
      GRANT SELECT,INSERT ON vet.evento_orden_laboratorio TO superkanes_app;
      CREATE INDEX ix_orden_laboratorio_atencion ON vet.orden_laboratorio(organizacion_id,atencion_id,creado_en,id);
      CREATE INDEX ix_resultado_laboratorio_orden ON vet.resultado_laboratorio(organizacion_id,orden_id,numero);
      ALTER TABLE vet.orden_laboratorio ENABLE ROW LEVEL SECURITY;
      ALTER TABLE vet.resultado_laboratorio ENABLE ROW LEVEL SECURITY;
      CREATE POLICY aislamiento_organizacion ON vet.orden_laboratorio USING(organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid) WITH CHECK(organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid);
      CREATE POLICY aislamiento_organizacion ON vet.resultado_laboratorio USING(organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid) WITH CHECK(organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid);
      CREATE TRIGGER z_metadata BEFORE INSERT OR UPDATE ON vet.orden_laboratorio FOR EACH ROW EXECUTE FUNCTION vet.actualizar_metadata();
      CREATE TRIGGER zz_auditoria AFTER INSERT OR UPDATE ON vet.orden_laboratorio FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();
      CREATE TRIGGER zz_auditoria AFTER INSERT ON vet.resultado_laboratorio FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();
      CREATE TRIGGER a_inmutable BEFORE UPDATE OR DELETE ON vet.resultado_laboratorio FOR EACH ROW EXECUTE FUNCTION vet.impedir_mutacion();
      GRANT SELECT,INSERT,UPDATE ON vet.orden_laboratorio TO superkanes_app;
      GRANT SELECT,INSERT ON vet.resultado_laboratorio TO superkanes_app;

      CREATE OR REPLACE VIEW vet.historial_mascota WITH (security_invoker=true) AS
      SELECT organizacion_id,mascota_id,id AS registro_id,'clinica'::text AS tipo,fecha_atencion AS fecha,estado FROM vet.atencion_clinica
      UNION ALL SELECT organizacion_id,mascota_id,id,'vacunacion',aplicada_en,estado FROM vet.vacunacion
      UNION ALL SELECT p.organizacion_id,p.mascota_id,p.id,'peluqueria',coalesce(p.llegada_en,p.fecha_servicio::timestamp AT TIME ZONE s.zona_horaria),p.estado
      FROM vet.servicio_peluqueria p JOIN vet.sede s ON s.organizacion_id=p.organizacion_id AND s.id=p.sede_id
      UNION ALL SELECT l.organizacion_id,a.mascota_id,l.id,'laboratorio',l.actualizado_en,l.estado FROM vet.orden_laboratorio l JOIN vet.atencion_clinica a ON a.organizacion_id=l.organizacion_id AND a.id=l.atencion_id;
      INSERT INTO vet.permiso(codigo,descripcion) VALUES('orden_laboratorio.read','Consultar órdenes y resultados de laboratorio'),('orden_laboratorio.create','Solicitar exámenes de laboratorio'),('orden_laboratorio.update','Registrar muestras, resultados y seguimiento de laboratorio');
    `);
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error('Conservar ordenes y resultados; usar migracion correctiva.'),
    );
  }
}
