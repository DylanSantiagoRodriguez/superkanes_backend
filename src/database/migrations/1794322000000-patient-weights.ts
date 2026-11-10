import { MigrationInterface, QueryRunner } from 'typeorm';
export class PatientWeights1794322000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`
      CREATE TABLE vet.peso_mascota (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        organizacion_id uuid NOT NULL REFERENCES vet.organizacion(id),
        mascota_id uuid NOT NULL,
        sede_id uuid NOT NULL,
        cita_id uuid,
        valor numeric(8,3) NOT NULL CHECK(valor>0),
        medida_en timestamptz NOT NULL,
        notas text,
        creado_en timestamptz NOT NULL DEFAULT now(),
        creado_por uuid NOT NULL REFERENCES vet.usuario(id),
        FOREIGN KEY(organizacion_id,mascota_id) REFERENCES vet.mascota(organizacion_id,id),
        FOREIGN KEY(organizacion_id,sede_id) REFERENCES vet.sede(organizacion_id,id),
        FOREIGN KEY(organizacion_id,cita_id) REFERENCES vet.cita(organizacion_id,id)
      );
      CREATE INDEX ix_peso_mascota_fecha ON vet.peso_mascota(organizacion_id,mascota_id,medida_en DESC,id DESC);
      ALTER TABLE vet.peso_mascota ENABLE ROW LEVEL SECURITY;
      CREATE POLICY aislamiento_organizacion ON vet.peso_mascota
        USING(organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid)
        WITH CHECK(organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid);
      CREATE TRIGGER a_inmutable BEFORE UPDATE OR DELETE ON vet.peso_mascota FOR EACH ROW EXECUTE FUNCTION vet.impedir_mutacion();
      CREATE TRIGGER zz_auditoria AFTER INSERT ON vet.peso_mascota FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();
      GRANT SELECT,INSERT ON vet.peso_mascota TO superkanes_app;
    `);
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error('Conservar pesajes; utilizar una migracion correctiva.'),
    );
  }
}
