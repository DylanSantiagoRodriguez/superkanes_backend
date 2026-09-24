import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { EntityManager } from 'typeorm';
import type { EntityTarget } from 'typeorm';
import { Identity } from '../auth/token.service';
import { Access, ResourceAccessService } from './resource-access.service';
import {
  Action,
  Resource,
  resource,
  resourceForEntity,
  resources,
  Row,
} from './resource-registry';
import { ResourceRulesService } from './resource-rules.service';
import {
  expectedVersion,
  listQuery,
  object,
  payload,
  uuid,
  field,
} from './resource-validation';

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonical(item)]),
    );
  return value;
}
@Injectable()
export class ResourcePersistenceService {
  constructor(
    private readonly access: ResourceAccessService,
    private readonly rules: ResourceRulesService,
  ) {}

  transferGuardian(
    identity: Identity,
    org: string,
    id: string,
    body: unknown,
    etag: unknown,
  ) {
    const input = object(body);
    if (
      Object.keys(input).some(
        (key) =>
          !['tutor_id', 'vigente_desde', 'autorizado_consentir'].includes(key),
      )
    )
      throw new BadRequestException('Campo no permitido');
    const relation = resource('mascota_tutor');
    const tutor = uuid(input.tutor_id, 'tutor_id');
    const date = field(
      relation.columnMap.get('vigente_desde')!,
      input.vigente_desde,
    );
    const authorized = field(
      relation.columnMap.get('autorizado_consentir')!,
      input.autorizado_consentir ?? false,
    );
    const version = expectedVersion(etag);
    const pet = resource('mascota');
    return this.access.run(identity, org, async (manager, a) => {
      const current = await this.find(manager, pet, id, a, 'update', true);
      this.checkVersion(current, version);
      for (const action of ['create', 'update'] as const)
        this.access.scopeSql(
          relation,
          'r',
          this.access.authorize(a, relation, action),
          [],
        );
      const rows: Row[] = await manager.query(
        'SELECT * FROM vet.mascota_tutor WHERE organizacion_id=$1 AND mascota_id=$2 AND es_principal AND vigente_hasta IS NULL FOR UPDATE',
        [org, id],
      );
      if (!rows[0] || rows[0].tutor_id === tutor)
        throw new ConflictException(
          'El nuevo tutor debe ser distinto del principal actual',
        );
      const dates: { today: string }[] = await manager.query(
        "SELECT to_char(current_timestamp AT TIME ZONE zona_horaria_default,'YYYY-MM-DD') AS today FROM vet.organizacion WHERE id=$1",
        [org],
      );
      if (date !== dates[0].today)
        throw new BadRequestException(
          'El cambio de tutor debe tener efecto hoy en la zona horaria de la clinica',
        );
      await this.patch(manager, relation, String(rows[0].id), {
        vigente_hasta: date,
      });
      const secondary: Row[] = await manager.query(
        'SELECT id FROM vet.mascota_tutor WHERE organizacion_id=$1 AND mascota_id=$2 AND tutor_id=$3 AND vigente_hasta IS NULL FOR UPDATE',
        [org, id, tutor],
      );
      if (secondary[0])
        await this.patch(manager, relation, String(secondary[0].id), {
          vigente_hasta: date,
        });
      const data = {
        mascota_id: id,
        tutor_id: tutor,
        vigente_desde: date,
        es_principal: true,
        autorizado_consentir: authorized,
      };
      await this.rules.validate(manager, relation, data, undefined, a);
      const guardian = await this.insert(manager, relation, data, a);
      const updated = await this.patch(manager, pet, id, {
        nombre: current.nombre,
      });
      return { data: updated, guardian, requestId: a.requestId };
    });
  }

  catalog(identity: Identity, org: string) {
    return this.access.run(identity, org, (_manager, a) =>
      Promise.resolve({
        resources: [...resources.values()]
          .filter((r) => a.permissions.has(`${r.name}.read`))
          .map((r) => ({
            name: r.name,
            create: r.create,
            update: r.update,
            deletion: r.deletion,
            platformWrite: r.platformWrite,
            fields: r.columns
              .filter(
                (c) => !['creado_por', 'actualizado_por'].includes(c.name),
              )
              .map((c) => ({
                name: c.name,
                type: c.type,
                nullable: c.nullable,
                enum: c.enum,
              })),
          })),
      }),
    );
  }
  list(
    identity: Identity,
    org: string,
    target: EntityTarget<object>,
    query: Row,
  ) {
    const r = resourceForEntity(target);
    const options = listQuery(r, query);
    return this.access.run(identity, org, async (manager, a) => {
      const params: unknown[] = [];
      const where = this.where(r, a, 'read', params);
      if (options.cursor) {
        params.push(options.cursor);
        where.push(`r.id > $${params.length}::uuid`);
      }
      for (const [key, value] of Object.entries(options.filters)) {
        if (value === null) where.push(`r."${key}" IS NULL`);
        else {
          params.push(value);
          where.push(`r."${key}"=$${params.length}`);
        }
      }
      params.push(options.limit + 1);
      const rows: Row[] = await manager
        .getRepository(r.entity)
        .query(
          `SELECT r.* FROM vet."${r.name}" r WHERE ${where.join(' AND ')} ORDER BY r.id ASC LIMIT $${params.length}`,
          params,
        );
      const more = rows.length > options.limit;
      const data = rows
        .slice(0, options.limit)
        .map((row) => this.project(r, row, a));
      await this.audit(manager, r, a.requestId, 'LIST');
      return {
        data,
        page: { limit: options.limit, next: more ? data.at(-1)?.id : null },
        requestId: a.requestId,
      };
    });
  }
  get(
    identity: Identity,
    org: string,
    target: EntityTarget<object>,
    id: string,
  ) {
    const r = resourceForEntity(target);
    return this.access.run(identity, org, async (manager, a) => {
      const row = await this.find(manager, r, id, a, 'read');
      await this.audit(manager, r, id, 'READ');
      return { data: this.project(r, row, a), requestId: a.requestId };
    });
  }
  create(
    identity: Identity,
    org: string,
    target: EntityTarget<object>,
    body: unknown,
    key: string,
  ) {
    const r = resourceForEntity(target);
    if (!r.create)
      throw new MethodNotAllowedException(
        'Recurso generado internamente; no admite creacion manual',
      );
    const input = { ...object(body) };
    const principal =
      r.name === 'mascota' ? input.tutor_principal_id : undefined;
    if (r.name === 'mascota') {
      uuid(principal, 'tutor_principal_id');
      delete input.tutor_principal_id;
    }
    const data = payload(r, input, true);
    const hash = createHash('sha256')
      .update(JSON.stringify(canonical({ resource: r.name, body })))
      .digest('hex');
    return this.access.run(identity, org, async (manager, a) => {
      const scope = this.access.authorize(a, r, 'create');
      this.access.scopeSql(r, 'r', scope, []);
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
        [`${org}:${a.userId}:${key}`],
      );
      const previous: {
        request_hash: string;
        resource: string;
        response: Row;
      }[] = await manager.query(
        'SELECT request_hash,resource,response FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at>now()',
        [org, a.userId, key],
      );
      if (previous[0]) {
        if (
          previous[0].request_hash !== hash ||
          previous[0].resource !== r.name
        )
          throw new ConflictException(
            'Idempotency-Key ya utilizado para otra solicitud',
          );
        await this.find(
          manager,
          r,
          String(previous[0].response.id),
          a,
          'create',
        );
        return {
          data: this.project(r, previous[0].response, a),
          requestId: a.requestId,
        };
      }
      await manager.query(
        'DELETE FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at<=now()',
        [org, a.userId, key],
      );
      await this.rules.validate(manager, r, data, undefined, a);
      const row = await this.insert(manager, r, data, a);
      if (principal) {
        const relation = resource('mascota_tutor');
        this.access.scopeSql(
          relation,
          'r',
          this.access.authorize(a, relation, 'create'),
          [],
        );
        const dates: { inicio: string }[] = await manager.query(
          "SELECT to_char(current_timestamp AT TIME ZONE zona_horaria_default,'YYYY-MM-DD') AS inicio FROM vet.organizacion WHERE id=$1",
          [org],
        );
        const values = {
          mascota_id: row.id,
          tutor_id: principal,
          es_principal: true,
          vigente_desde: dates[0].inicio,
        };
        await this.rules.validate(manager, relation, values, undefined, a);
        await this.insert(manager, relation, values, a);
      }
      await this.find(manager, r, String(row.id), a, 'create');
      if (!r.tenant)
        await this.audit(manager, r, String(row.id), 'INSERT_GLOBAL');
      await manager.query(
        'INSERT INTO api.idempotency(organizacion_id,usuario_id,key,resource,request_hash,response) VALUES($1,$2,$3,$4,$5,$6)',
        [org, a.userId, key, r.name, hash, JSON.stringify(row)],
      );
      return { data: this.project(r, row, a), requestId: a.requestId };
    });
  }
  update(
    identity: Identity,
    org: string,
    target: EntityTarget<object>,
    id: string,
    body: unknown,
    etag: unknown,
  ) {
    const r = resourceForEntity(target);
    if (!r.update) throw new MethodNotAllowedException('Registro inmutable');
    const version = expectedVersion(etag);
    const data = payload(r, body, false);
    return this.access.run(identity, org, async (manager, a) => {
      const old = await this.find(manager, r, id, a, 'update', true);
      this.checkVersion(old, version);
      await this.rules.validate(manager, r, data, old, a);
      const row = await this.patch(manager, r, id, data);
      await this.find(manager, r, id, a, 'update');
      if (!r.tenant) await this.audit(manager, r, id, 'UPDATE_GLOBAL');
      return { data: this.project(r, row, a), requestId: a.requestId };
    });
  }
  delete(
    identity: Identity,
    org: string,
    target: EntityTarget<object>,
    id: string,
    etag: unknown,
  ) {
    const r = resourceForEntity(target);
    if (r.deletion === 'none')
      throw new MethodNotAllowedException(
        'Este recurso se conserva; utilice una correccion o anulacion autorizada',
      );
    const version = expectedVersion(etag);
    return this.access.run(identity, org, async (manager, a) => {
      const old = await this.find(manager, r, id, a, 'delete', true);
      this.checkVersion(old, version);
      if (r.deletion === 'soft') {
        const data = Object.fromEntries([r.soft!]);
        await this.rules.validate(manager, r, data, old, a);
        await this.patch(manager, r, id, data);
      } else {
        if (r.name === 'asignacion_rol') {
          const self: Row[] = await manager.query(
            'SELECT id FROM vet.membresia WHERE id=$1 AND usuario_id=$2 AND organizacion_id=$3',
            [old.membresia_id, a.userId, org],
          );
          if (self.length && !a.platformAdmin)
            throw new ConflictException(
              'Otro administrador debe retirar su asignacion',
            );
        }
        await manager.getRepository(r.entity).delete(id);
      }
      if (!r.tenant) await this.audit(manager, r, id, 'DELETE_GLOBAL');
    });
  }
  private where(
    r: Resource,
    a: Access,
    action: Action,
    params: unknown[],
  ): string[] {
    const scope = this.access.authorize(a, r, action);
    const where = [this.access.scopeSql(r, 'r', scope, params)];
    if (r.tenant) {
      params.push(a.organizationId);
      where.push(`r.organizacion_id=$${params.length}`);
    }
    if (r.name === 'organizacion' && !a.platformAdmin) {
      params.push(a.organizationId);
      where.push(`r.id=$${params.length}`);
    }
    return where;
  }
  private async find(
    manager: EntityManager,
    r: Resource,
    id: string,
    a: Access,
    action: Action,
    lock = false,
  ): Promise<Row> {
    const params: unknown[] = [];
    const where = this.where(r, a, action, params);
    params.push(id);
    where.push(`r.id=$${params.length}`);
    const rows: Row[] = await manager
      .getRepository(r.entity)
      .query(
        `SELECT r.* FROM vet."${r.name}" r WHERE ${where.join(' AND ')}${lock ? ' FOR UPDATE OF r' : ''}`,
        params,
      );
    if (!rows[0]) throw new NotFoundException('Registro no disponible');
    return rows[0];
  }
  private async insert(
    manager: EntityManager,
    r: Resource,
    data: Row,
    a: Access,
  ): Promise<Row> {
    const values: Row = { ...data, id: randomUUID() };
    if (r.tenant) values.organizacion_id = a.organizationId;
    if (r.audit) values.creado_por = a.userId;
    const result = await manager
      .getRepository(r.entity)
      .createQueryBuilder()
      .insert()
      .values(values)
      .returning('*')
      .execute();
    return (result.raw as Row[])[0];
  }
  private async patch(
    manager: EntityManager,
    r: Resource,
    id: string,
    data: Row,
  ): Promise<Row> {
    const result = await manager
      .getRepository(r.entity)
      .createQueryBuilder()
      .update()
      .set(data)
      .where('id = :id', { id })
      .returning('*')
      .execute();
    return (result.raw as Row[])[0];
  }
  private checkVersion(row: Row, version: number) {
    if (row.version !== version)
      throw new HttpException('El registro cambio; vuelva a consultarlo', 412);
  }
  private project(r: Resource, row: Row, a: Access): Row {
    const result = { ...row };
    if (r.name === 'usuario' && !a.platformAdmin) {
      delete result.proveedor_identidad;
      delete result.identificador_externo;
    }
    return result;
  }
  private audit(
    manager: EntityManager,
    r: Resource,
    id: string,
    operation: string,
  ) {
    return manager.query('SELECT vet.record_api_access($1,$2,$3)', [
      r.name,
      id,
      operation,
    ]);
  }
}
