import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SecureResourceApi1790200002000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(
      await readFile(join(__dirname, 'sql', 'secure-resource-api.sql'), 'utf8'),
    );
    await runner.query(
      await readFile(
        join(__dirname, 'sql', 'resource-permissions.sql'),
        'utf8',
      ),
    );
  }
  down(): Promise<void> {
    return Promise.reject(
      new Error(
        'Revertir seguridad requiere una migracion correctiva revisada',
      ),
    );
  }
}
