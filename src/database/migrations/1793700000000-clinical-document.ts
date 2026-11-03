import { MigrationInterface, QueryRunner } from 'typeorm';
export class ClinicalDocument1793700000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`ALTER TABLE vet.revision_clinica ADD COLUMN documento jsonb;
      ALTER TABLE vet.revision_clinica ADD CONSTRAINT ck_revision_documento CHECK
      (documento IS NULL OR (jsonb_typeof(documento)='object' AND documento->>'type'='doc' AND octet_length(documento::text)<=1200000));`);
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'Los documentos clínicos se conservan; usar una migración correctiva o restaurar un respaldo.',
      ),
    );
  }
}
