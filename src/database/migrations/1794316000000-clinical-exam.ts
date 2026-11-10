import { MigrationInterface, QueryRunner } from 'typeorm';
export class ClinicalExam1794316000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(
      'ALTER TABLE vet.revision_clinica ADD COLUMN examen_fisico text',
    );
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'Conservar los examenes registrados; usar migracion correctiva.',
      ),
    );
  }
}
