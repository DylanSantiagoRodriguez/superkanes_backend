import { Injectable } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { DataSource, EntityManager } from 'typeorm';

// Debe proceder de una identidad y membresia autorizadas, nunca de un header libre.
export interface AuthorizedTenantContext {
  organizationId: string;
  userId: string;
  requestId: string;
}

@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

  async checkReadiness(): Promise<void> {
    const rows: { ready: boolean }[] = await this.dataSource.query(`
      SELECT current_user = 'superkanes_app'
        AND NOT r.rolsuper AND NOT r.rolbypassrls
        AND to_regclass('vet.mascota') IS NOT NULL
        AND to_regclass('vet.revision_clinica') IS NOT NULL
        AND to_regclass('auth.credential') IS NOT NULL
        AND to_regclass('auth.session') IS NOT NULL
        AND to_regclass('vet.evento_auditoria') IS NOT NULL AS ready
      FROM pg_roles r WHERE r.rolname = current_user
    `);
    if (rows[0]?.ready !== true)
      throw new Error('Database is not initialized for the application');
  }

  async withTenant<T>(
    context: AuthorizedTenantContext,
    operation: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    if (
      ![context.organizationId, context.userId, context.requestId].every((id) =>
        isUUID(id),
      )
    ) {
      throw new Error('Invalid authorized tenant context');
    }
    return this.dataSource.transaction(async (manager) => {
      await manager.query(
        `SELECT set_config('app.organizacion_id', $1, true),
                set_config('app.usuario_id', $2, true),
                set_config('app.request_id', $3, true)`,
        [context.organizationId, context.userId, context.requestId],
      );
      // Usar unicamente este manager/repositorios de este manager dentro de la transaccion.
      return operation(manager);
    });
  }
}
