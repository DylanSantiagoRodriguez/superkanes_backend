import 'reflect-metadata';
import { ClinicalDocument1793700000000 } from './migrations/1793700000000-clinical-document';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { InitialSchema1790200000000 } from './migrations/1790200000000-initial-schema';
import { SecureResourceApi1790200002000 } from './migrations/1790200002000-secure-resource-api';
import { LocalAuth1790200003000 } from './migrations/1790200003000-local-auth';

config({
  path: [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../.env')],
  quiet: true,
});
const password = process.env.POSTGRES_PASSWORD;
if (!password || password.startsWith('REPLACE_')) {
  throw new Error(
    'POSTGRES_PASSWORD is required for migrations (owner connection only)',
  );
}
const port = Number(process.env.POSTGRES_PORT ?? 5432);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('Invalid POSTGRES_PORT');

// Solo el proceso de migraciones utiliza al propietario. Nunca importar en AppModule.
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port,
  database: process.env.POSTGRES_DB ?? 'superkanes',
  username: 'superkanes_owner',
  password,
  schema: 'public',
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: 'typeorm_migrations',
  migrationsTransactionMode: 'all',
  migrations: [
    InitialSchema1790200000000,
    SecureResourceApi1790200002000,
    LocalAuth1790200003000,
    ClinicalDocument1793700000000,
  ],
  logging: ['error', 'migration'],
  extra: { max: 1, connectionTimeoutMillis: 10000 },
});
