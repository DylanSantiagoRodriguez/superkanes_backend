import { MigrationInterface, QueryRunner } from 'typeorm';
export class ClinicalDocumentArchive1794321000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`
      ALTER TABLE vet.atencion_clinica ADD CONSTRAINT uq_atencion_paciente_documento UNIQUE(organizacion_id,id,mascota_id);
      ALTER TABLE vet.revision_clinica ADD CONSTRAINT uq_revision_atencion_documento UNIQUE(organizacion_id,id,atencion_id);
      CREATE TABLE vet.documento_clinico_version (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        organizacion_id uuid NOT NULL REFERENCES vet.organizacion(id),
        mascota_id uuid NOT NULL,
        atencion_id uuid NOT NULL,
        revision_id uuid NOT NULL,
        archivo_id uuid NOT NULL,
        version_revision integer NOT NULL CHECK(version_revision>0),
        creado_en timestamptz NOT NULL DEFAULT now(),
        creado_por uuid NOT NULL REFERENCES vet.usuario(id),
        UNIQUE(organizacion_id,revision_id,version_revision),
        UNIQUE(organizacion_id,archivo_id),
        FOREIGN KEY(organizacion_id,mascota_id) REFERENCES vet.mascota(organizacion_id,id),
        FOREIGN KEY(organizacion_id,atencion_id,mascota_id) REFERENCES vet.atencion_clinica(organizacion_id,id,mascota_id),
        FOREIGN KEY(organizacion_id,revision_id,atencion_id) REFERENCES vet.revision_clinica(organizacion_id,id,atencion_id),
        FOREIGN KEY(organizacion_id,archivo_id) REFERENCES vet.archivo(organizacion_id,id)
      );
      CREATE INDEX ix_documento_clinico_paciente ON vet.documento_clinico_version(organizacion_id,mascota_id,id);
      ALTER TABLE vet.documento_clinico_version ENABLE ROW LEVEL SECURITY;
      CREATE POLICY aislamiento_organizacion ON vet.documento_clinico_version
        USING(organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid)
        WITH CHECK(organizacion_id=nullif(current_setting('app.organizacion_id',true),'')::uuid);
      CREATE TRIGGER a_inmutable BEFORE UPDATE OR DELETE ON vet.documento_clinico_version FOR EACH ROW EXECUTE FUNCTION vet.impedir_mutacion();
      CREATE TRIGGER zz_auditoria AFTER INSERT ON vet.documento_clinico_version FOR EACH ROW EXECUTE FUNCTION vet.auditar_cambio();
      GRANT SELECT,INSERT ON vet.documento_clinico_version TO superkanes_app;
    `);
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'Conservar versiones documentales; usar migración correctiva o restaurar respaldo coherente.',
      ),
    );
  }
}
