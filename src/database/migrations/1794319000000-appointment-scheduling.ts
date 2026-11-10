import { MigrationInterface, QueryRunner } from 'typeorm';
export class AppointmentScheduling1794319000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`CREATE EXTENSION IF NOT EXISTS btree_gist;
      ALTER TABLE vet.cita ADD COLUMN llegada_en timestamptz;
      ALTER TABLE vet.cita ADD CONSTRAINT ex_cita_responsable EXCLUDE USING gist
      (organizacion_id WITH =,responsable_id WITH =,tstzrange(inicio,fin,'[)') WITH &&)
      WHERE(responsable_id IS NOT NULL AND estado IN ('programada','confirmada','en_atencion'));`);
  }
  async down(runner: QueryRunner): Promise<void> {
    await runner.query(
      'ALTER TABLE vet.cita DROP CONSTRAINT ex_cita_responsable',
    );
    // Preserve arrival information and the shared extension.
  }
}
