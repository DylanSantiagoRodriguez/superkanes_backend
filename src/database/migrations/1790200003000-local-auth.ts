import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class LocalAuth1790200003000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(
      await readFile(join(__dirname, 'sql', 'local-auth.sql'), 'utf8'),
    );
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'Las credenciales y sesiones requieren una migracion correctiva; no se borran automaticamente',
      ),
    );
  }
}
