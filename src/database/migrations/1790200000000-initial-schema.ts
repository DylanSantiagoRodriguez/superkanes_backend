import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1790200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const existing = (await queryRunner.query(
      "SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'vet') AS exists",
    )) as { exists: boolean }[];
    if (existing[0]?.exists) {
      throw new Error(
        'El esquema vet ya existe sin esta migracion. Revisar y establecer una baseline; no se borran datos ni se omite la validacion automaticamente.',
      );
    }
    const sql = await readFile(
      join(__dirname, 'sql', 'initial-schema.sql'),
      'utf8',
    );
    await queryRunner.query(sql);
    await queryRunner.query(`
      GRANT USAGE ON SCHEMA vet TO superkanes_app;
      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA vet TO superkanes_app;
      REVOKE INSERT, UPDATE, DELETE ON vet.evento_auditoria FROM superkanes_app;
      REVOKE ALL ON vet.usuario, vet.organizacion, vet.permiso FROM superkanes_app;
    `);
  }

  public down(): Promise<void> {
    return Promise.reject(
      new Error(
        'La migracion inicial no se revierte automaticamente: protege los historiales. Use una migracion correctiva o un procedimiento de restauracion aprobado.',
      ),
    );
  }
}
