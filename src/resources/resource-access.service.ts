import { ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Identity } from '../auth/token.service';
import {
  Action,
  permissionCodes,
  Resource,
  resource,
} from './resource-registry';
import { randomUUID } from 'node:crypto';

export interface Access {
  organizationId: string;
  userId: string;
  requestId: string;
  platformAdmin: boolean;
  permissions: Map<string, Set<string | null>>;
}
@Injectable()
export class ResourceAccessService {
  constructor(private readonly source: DataSource) {}
  async run<T>(
    identity: Identity,
    organizationId: string,
    operation: (manager: EntityManager, access: Access) => Promise<T>,
  ): Promise<T> {
    return this.source.transaction(async (manager) => {
      const identities: { id: string }[] = await manager.query(
        'SELECT * FROM vet.resolve_api_identity($1,$2)',
        [identity.issuer, identity.subject],
      );
      if (!identities[0]) throw new ForbiddenException('Usuario no habilitado');
      const access: Access = {
        organizationId,
        userId: identities[0].id,
        requestId: randomUUID(),
        platformAdmin: identity.platformAdmin,
        permissions: new Map(),
      };
      await manager.query(
        `SELECT set_config('app.organizacion_id',$1,true),set_config('app.usuario_id',$2,true),set_config('app.request_id',$3,true),set_config('app.platform_admin',$4,true)`,
        [
          organizationId,
          access.userId,
          access.requestId,
          identity.platformAdmin ? 'true' : 'false',
        ],
      );
      const org: { id: string }[] = await manager.query(
        "SELECT id FROM vet.organizacion WHERE id=$1 AND estado='activa'",
        [organizationId],
      );
      if (!org.length)
        throw new ForbiddenException('Organizacion no disponible');
      if (identity.platformAdmin) {
        for (const code of permissionCodes())
          access.permissions.set(code, new Set([null]));
      } else {
        const members: { id: string }[] = await manager.query(
          'SELECT id FROM vet.membresia WHERE organizacion_id=$1 AND usuario_id=$2 AND activo FOR SHARE',
          [organizationId, access.userId],
        );
        if (!members.length)
          throw new ForbiddenException('Membresia no habilitada');
        const grants: { codigo: string; sede_id: string | null }[] =
          await manager.query(
            `SELECT p.codigo,a.sede_id FROM vet.asignacion_rol a
          JOIN vet.rol_permiso rp ON rp.organizacion_id=a.organizacion_id AND rp.rol_id=a.rol_id
          JOIN vet.permiso p ON p.id=rp.permiso_id
          WHERE a.organizacion_id=$1 AND a.membresia_id=$2`,
            [organizationId, members[0].id],
          );
        for (const grant of grants) {
          if (!access.permissions.has(grant.codigo))
            access.permissions.set(grant.codigo, new Set());
          access.permissions.get(grant.codigo)!.add(grant.sede_id);
        }
      }
      return operation(manager, access);
    });
  }
  authorize(access: Access, r: Resource, action: Action): Set<string | null> {
    if (action !== 'read' && r.platformWrite && !access.platformAdmin)
      throw new ForbiddenException(
        'Operacion reservada a administracion de plataforma',
      );
    const scope = access.permissions.get(`${r.name}.${action}`);
    if (!scope?.size) throw new ForbiddenException('Permiso insuficiente');
    return scope;
  }
  scopeSql(
    r: Resource,
    alias: string,
    scope: Set<string | null>,
    params: unknown[],
  ): string {
    if (scope.has(null)) return 'TRUE';
    if (r.site) {
      params.push([...scope]);
      return `${alias}."${r.site}" = ANY($${params.length}::uuid[])`;
    }
    if (r.name === 'consentimiento') {
      params.push([...scope]);
      return `(EXISTS(SELECT 1 FROM vet.atencion_clinica c WHERE c.organizacion_id=${alias}.organizacion_id AND c.id=${alias}.atencion_id AND c.sede_id=ANY($${params.length}::uuid[])) OR EXISTS(SELECT 1 FROM vet.servicio_peluqueria p WHERE p.organizacion_id=${alias}.organizacion_id AND p.id=${alias}.servicio_id AND p.sede_id=ANY($${params.length}::uuid[])))`;
    }
    if (r.parent) {
      const [parent, key] = r.parent;
      const parentAlias = `${alias}_p`;
      const nested = this.scopeSql(
        resource(parent),
        parentAlias,
        scope,
        params,
      );
      return `EXISTS (SELECT 1 FROM vet."${parent}" ${parentAlias} WHERE ${parentAlias}.id=${alias}."${key}" AND ${parentAlias}.organizacion_id=${alias}.organizacion_id AND ${nested})`;
    }
    throw new ForbiddenException(
      'Este recurso compartido requiere permiso a nivel de organizacion',
    );
  }
}
