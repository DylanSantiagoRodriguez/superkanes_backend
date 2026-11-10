import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
  serverFields,
} from './resource-registry';
import {
  graphs,
  immutable,
  ResourceRulesService,
} from './resource-rules.service';
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

  /** Coordinated writes use the existing validation, scoped access and transaction. */
  saveClinical(
    identity: Identity,
    org: string,
    id: string,
    body: unknown,
    key: string,
    etag: unknown,
  ) {
    const input = object(body);
    if (
      Object.keys(input).some(
        (k) => !['revision', 'operations', 'close'].includes(k),
      )
    )
      throw new BadRequestException('Campo no permitido');
    const narrative = object(input.revision ?? {});
    if (
      Object.keys(narrative).some(
        (k) =>
          ![
            'motivo_consulta',
            'anamnesis',
            'examen_fisico',
            'evaluacion',
            'plan',
            'documento',
          ].includes(k),
      )
    )
      throw new BadRequestException('Campo clinico no permitido');
    if (input.close !== undefined && typeof input.close !== 'boolean')
      throw new BadRequestException('Cierre invalido');
    const operations = input.operations ?? [];
    if (!Array.isArray(operations) || operations.length > 100)
      throw new BadRequestException('Demasiadas operaciones');
    return this.clinicalOperation(
      identity,
      org,
      id,
      key,
      etag,
      input,
      'clinical-save',
      async (manager, a, revision, attention) => {
        if (revision.estado !== 'borrador' || attention.estado === 'anulada')
          throw new ConflictException('La revision no admite cambios');
        // Require the same authenticated professional for the coordinated clinical workflow.
        await this.rules.validate(
          manager,
          resource('atencion_clinica'),
          { profesional_id: attention.profesional_id },
          attention,
          a,
        );
        const saved: Row[] = [];
        for (const raw of operations) {
          const op = object(raw);
          if (
            Object.keys(op).some(
              (k) =>
                !['resource', 'id', 'version', 'data', 'remove'].includes(k),
            )
          )
            throw new BadRequestException('Operacion no valida');
          if (
            typeof op.resource !== 'string' ||
            ![
              'medicion_clinica',
              'diagnostico_atencion',
              'seccion_clinica',
              'prescripcion',
              'prescripcion_item',
              'adjunto_clinico',
            ].includes(op.resource)
          )
            throw new BadRequestException('Recurso no admitido en consulta');
          if (op.remove !== undefined && typeof op.remove !== 'boolean')
            throw new BadRequestException('Eliminacion invalida');
          const r = resource(op.resource);
          const action: Action = op.remove
            ? 'delete'
            : op.id
              ? 'update'
              : 'create';
          const scope = this.access.authorize(a, r, action);
          this.access.scopeSql(r, 'r', scope, []);
          const old = op.id
            ? await this.find(manager, r, uuid(op.id), a, action, true)
            : undefined;
          if (old)
            this.checkVersion(old, expectedVersion(`"${String(op.version)}"`));
          if (op.remove && !old)
            throw new BadRequestException('Falta registro a retirar');
          const rawData = object(op.data ?? {});
          let parent: unknown = revision.id;
          if (r.name === 'prescripcion_item') {
            parent = old?.prescripcion_id ?? rawData.prescripcion_id;
            const prescription = await this.find(
              manager,
              resource('prescripcion'),
              uuid(parent),
              a,
              'read',
            );
            if (prescription.revision_id !== revision.id)
              throw new ConflictException('Prescripcion de otra revision');
          }
          const parentKey =
            r.name === 'prescripcion_item' ? 'prescripcion_id' : 'revision_id';
          if (old && old[parentKey] !== parent)
            throw new ConflictException('Detalle de otra revision');
          if (rawData[parentKey] !== undefined && rawData[parentKey] !== parent)
            throw new BadRequestException('Relacion clinica no permitida');
          const data = payload(
            r,
            {
              ...rawData,
              [parentKey]: parent,
              ...(r.name === 'prescripcion' && !old
                ? { profesional_id: attention.profesional_id }
                : {}),
            },
            !old,
          );
          if (op.remove) {
            if (r.deletion !== 'hard')
              throw new BadRequestException('Este detalle se conserva');
            await manager.getRepository(r.entity).delete(String(old!.id));
          } else {
            await this.rules.validate(manager, r, data, old, a);
            const row = old
              ? await this.patch(manager, r, String(old.id), data)
              : await this.insert(manager, r, data, a);
            await this.find(manager, r, String(row.id), a, action);
            saved.push({ resource: r.name, ...row });
          }
        }
        const r = resource('revision_clinica');
        const data = payload(
          r,
          {
            ...narrative,
            ...(input.close ? { estado: 'cerrada' } : {}),
            motivo_consulta:
              narrative.motivo_consulta ?? revision.motivo_consulta,
          },
          false,
        );
        if (input.close) {
          const merged = { ...revision, ...data };
          if (
            ['motivo_consulta', 'evaluacion', 'plan'].some(
              (k) => typeof merged[k] !== 'string' || !String(merged[k]).trim(),
            )
          )
            throw new BadRequestException(
              'Registre motivo, evaluacion y plan antes de cerrar',
            );
          await this.find(
            manager,
            resource('atencion_clinica'),
            String(attention.id),
            a,
            'update',
          );
        }
        await this.rules.validate(manager, r, data, revision, a);
        const updated = await this.patch(manager, r, id, data);
        if (input.close && attention.estado === 'abierta') {
          const attentionData = { estado: 'cerrada' };
          await this.rules.validate(
            manager,
            resource('atencion_clinica'),
            attentionData,
            attention,
            a,
          );
          await this.patch(
            manager,
            resource('atencion_clinica'),
            String(attention.id),
            attentionData,
          );
        }
        return { revision: updated, details: saved };
      },
    );
  }

  correctClinical(
    identity: Identity,
    org: string,
    id: string,
    body: unknown,
    key: string,
    etag: unknown,
  ) {
    const input = object(body);
    if (
      Object.keys(input).some((k) => k !== 'motivo_cambio') ||
      typeof input.motivo_cambio !== 'string' ||
      !input.motivo_cambio.trim() ||
      input.motivo_cambio.length > 4000
    )
      throw new BadRequestException('Indique el motivo de la correccion');
    return this.clinicalOperation(
      identity,
      org,
      id,
      key,
      etag,
      input,
      'clinical-correct',
      async (manager, a, previous, attention) => {
        if (previous.estado !== 'cerrada' || attention.estado === 'anulada')
          throw new ConflictException(
            'Solo se corrigen revisiones cerradas de atenciones no anuladas',
          );
        await this.rules.validate(
          manager,
          resource('atencion_clinica'),
          { profesional_id: attention.profesional_id },
          attention,
          a,
        );
        const revisionResource = resource('revision_clinica');
        this.access.authorize(a, revisionResource, 'create');
        const revisionData = payload(
          revisionResource,
          {
            atencion_id: attention.id,
            numero: Number(previous.numero) + 1,
            revision_previa_id: id,
            motivo_cambio: input.motivo_cambio,
            motivo_consulta: previous.motivo_consulta,
            anamnesis: previous.anamnesis,
            examen_fisico: previous.examen_fisico,
            evaluacion: previous.evaluacion,
            plan: previous.plan,
            documento: previous.documento,
          },
          true,
        );
        await this.rules.validate(
          manager,
          revisionResource,
          revisionData,
          undefined,
          a,
        );
        const revision = await this.insert(
          manager,
          revisionResource,
          revisionData,
          a,
        );
        await this.find(
          manager,
          revisionResource,
          String(revision.id),
          a,
          'create',
        );
        const prescriptionIds = new Map<string, string>();
        for (const name of [
          'seccion_clinica',
          'medicion_clinica',
          'diagnostico_atencion',
          'prescripcion',
          'prescripcion_item',
          'adjunto_clinico',
        ]) {
          const r = resource(name);
          // No silent partial corrections: cloning existing details requires read/create scope.
          const rows: Row[] = await manager.query(
            name === 'prescripcion_item'
              ? 'SELECT r.* FROM vet.prescripcion_item r JOIN vet.prescripcion p ON p.id=r.prescripcion_id AND p.organizacion_id=r.organizacion_id WHERE p.organizacion_id=$1 AND p.revision_id=$2 LIMIT 1001'
              : `SELECT * FROM vet."${name}" WHERE organizacion_id=$1 AND revision_id=$2 LIMIT 1001`,
            [org, id],
          );
          if (rows.length > 1000)
            throw new ConflictException(
              'Revision demasiado extensa para correccion automatica',
            );
          if (!rows.length) continue;
          this.access.authorize(a, r, 'create');
          for (const row of rows) {
            await this.find(manager, r, String(row.id), a, 'read');
            const values: Row = Object.fromEntries(
              r.columns
                .filter((c) => !serverFields.has(c.name))
                .map((c) => [c.name, row[c.name]]),
            );
            if (name === 'prescripcion_item')
              values.prescripcion_id = prescriptionIds.get(
                String(row.prescripcion_id),
              );
            else values.revision_id = revision.id;
            if (name === 'prescripcion')
              values.profesional_id = attention.profesional_id;
            await this.rules.validate(manager, r, values, undefined, a);
            const copy = await this.insert(manager, r, values, a);
            await this.find(manager, r, String(copy.id), a, 'create');
            if (name === 'prescripcion')
              prescriptionIds.set(String(row.id), String(copy.id));
          }
        }
        return {
          revision: await this.find(
            manager,
            revisionResource,
            String(revision.id),
            a,
            'read',
          ),
        };
      },
    );
  }

  private clinicalOperation(
    identity: Identity,
    org: string,
    id: string,
    key: string,
    etag: unknown,
    body: Row,
    operation: string,
    execute: (
      manager: EntityManager,
      a: Access,
      revision: Row,
      attention: Row,
    ) => Promise<Row>,
  ) {
    const version = expectedVersion(etag);
    const hash = createHash('sha256')
      .update(JSON.stringify(canonical({ id, version, body, operation })))
      .digest('hex');
    return this.access.run(identity, org, async (manager, a) => {
      const r = resource('revision_clinica');
      const initial = await this.find(manager, r, id, a, 'read');
      const attention = await this.find(
        manager,
        resource('atencion_clinica'),
        String(initial.atencion_id),
        a,
        'read',
        true,
      );
      const current = await this.find(
        manager,
        r,
        id,
        a,
        operation === 'clinical-correct' ? 'read' : 'update',
        true,
      );
      if (operation === 'clinical-correct')
        this.access.authorize(a, r, 'create');
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
        [`${org}:${a.userId}:${key}`],
      );
      const prior: { request_hash: string; resource: string; response: Row }[] =
        await manager.query(
          'SELECT request_hash,resource,response FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at>now()',
          [org, a.userId, key],
        );
      if (prior[0]) {
        if (prior[0].request_hash !== hash || prior[0].resource !== operation)
          throw new ConflictException('Idempotency-Key ya utilizado');
        const details = prior[0].response.details;
        if (Array.isArray(details))
          for (const raw of details) {
            const detail = object(raw);
            await this.find(
              manager,
              resource(String(detail.resource)),
              uuid(detail.id),
              a,
              'read',
            );
          }
        return { data: prior[0].response };
      }
      this.checkVersion(current, version);
      const result = await execute(manager, a, current, attention);
      await manager.query(
        'DELETE FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at<=now()',
        [org, a.userId, key],
      );
      await manager.query(
        'INSERT INTO api.idempotency(organizacion_id,usuario_id,key,resource,request_hash,response) VALUES($1,$2,$3,$4,$5,$6)',
        [org, a.userId, key, operation, hash, JSON.stringify(result)],
      );
      return { data: result };
    });
  }

  clinicalAuthor(identity: Identity, org: string) {
    return this.access.run(identity, org, async (manager, a) => {
      this.access.authorize(a, resource('atencion_clinica'), 'create');
      const rows: Row[] = await manager.query(
        `SELECT p.id,p.nombre_profesional FROM vet.profesional p
         JOIN vet.membresia m ON m.id=p.membresia_id AND m.organizacion_id=p.organizacion_id
         WHERE p.organizacion_id=$1 AND m.usuario_id=$2 AND m.activo`,
        [org, a.userId],
      );
      return { data: rows[0] ?? null };
    });
  }

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
          .filter((r) => this.catalogPermission(a, r, 'read'))
          .map((r) => ({
            name: r.name,
            create: r.create,
            update: r.update,
            deletion: r.deletion,
            platformWrite: r.platformWrite,
            permissions: {
              create:
                r.create &&
                this.catalogPermission(a, r, 'create') &&
                (r.name !== 'mascota' ||
                  this.catalogPermission(
                    a,
                    resource('mascota_tutor'),
                    'create',
                  )),
              update: r.update && this.catalogPermission(a, r, 'update'),
              delete:
                r.deletion !== 'none' && this.catalogPermission(a, r, 'delete'),
            },
            deletionEffect: r.soft ?? null,
            transitions: graphs[r.name] ?? null,
            fields: [
              ...r.columns
                .filter(
                  (c) => !['creado_por', 'actualizado_por'].includes(c.name),
                )
                .map((c) => ({
                  name: c.name,
                  type: c.type,
                  nullable: c.nullable,
                  enum: c.enum,
                  required:
                    !c.nullable &&
                    c.default === null &&
                    !serverFields.has(c.name),
                  default: c.default,
                  create: !serverFields.has(c.name),
                  update:
                    !serverFields.has(c.name) &&
                    !(immutable[r.name] ?? []).includes(c.name),
                  reference:
                    r.refs
                      .filter(
                        (ref) =>
                          ref.columns.includes(c.name) &&
                          c.name !== 'organizacion_id',
                      )
                      .map((ref) => ({
                        resource: ref.target,
                        field: ref.targetColumns[ref.columns.indexOf(c.name)],
                      }))[0] ?? null,
                })),
              ...(r.name === 'mascota'
                ? [
                    {
                      name: 'tutor_principal_id',
                      type: 'uuid',
                      nullable: false,
                      enum: [],
                      required: true,
                      default: null,
                      create: true,
                      update: false,
                      reference: { resource: 'tutor', field: 'id' },
                    },
                  ]
                : []),
            ],
          })),
      }),
    );
  }
  private catalogPermission(a: Access, r: Resource, action: Action): boolean {
    try {
      const scope = this.access.authorize(a, r, action);
      this.access.scopeSql(r, 'r', scope, []);
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) return false;
      throw error;
    }
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
    initialRevision?: Row,
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
      .update(
        JSON.stringify(
          canonical({
            resource: r.name,
            body,
            ...(initialRevision ? { initialRevision } : {}),
          }),
        ),
      )
      .digest('hex');
    return this.access.run(identity, org, async (manager, a) => {
      const scope = this.access.authorize(a, r, 'create');
      if (initialRevision)
        this.access.authorize(a, resource('revision_clinica'), 'create');
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
      if (initialRevision) {
        if (r.name !== 'atencion_clinica')
          throw new BadRequestException('Historia no aplicable');
        const revision = resource('revision_clinica');
        const values = payload(
          revision,
          {
            ...initialRevision,
            atencion_id: row.id,
            numero: 1,
            estado: 'borrador',
          },
          true,
        );
        await this.rules.validate(manager, revision, values, undefined, a);
        const inserted = await this.insert(manager, revision, values, a);
        await this.find(manager, revision, String(inserted.id), a, 'create');
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
