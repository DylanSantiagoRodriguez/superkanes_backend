import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { EntityManager } from 'typeorm';
import type { Identity } from '../auth/token.service';
import {
  Access,
  ResourceAccessService,
} from '../resources/resource-access.service';
import { resource, Row } from '../resources/resource-registry';
import {
  expectedVersion,
  object,
  uuid,
} from '../resources/resource-validation';
@Injectable()
export class LaboratoryService {
  constructor(private readonly access: ResourceAccessService) {}
  permissions(identity: Identity, org: string) {
    return this.access.run(identity, org, (_manager, a) =>
      Promise.resolve({
        data: Object.fromEntries(
          ['read', 'create', 'update'].map((action) => [
            action,
            !!a.permissions.get(`orden_laboratorio.${action}`)?.size,
          ]),
        ),
      }),
    );
  }
  private scope(a: Access, action: string, alias: string, params: unknown[]) {
    const grants = a.permissions.get(`orden_laboratorio.${action}`);
    if (!grants?.size)
      throw new ForbiddenException('Permiso de laboratorio requerido');
    return this.access.scopeSql(
      resource('atencion_clinica'),
      alias,
      grants,
      params,
    );
  }
  private async attention(
    manager: EntityManager,
    a: Access,
    id: string,
    action: string,
    author = false,
  ) {
    const params: unknown[] = [a.organizationId, id],
      scope = this.scope(a, action, 'r', params);
    const read = this.access.scopeSql(
      resource('atencion_clinica'),
      'r',
      this.access.authorize(a, resource('atencion_clinica'), 'read'),
      params,
    );
    const rows: Row[] = await manager.query(
      `SELECT r.* FROM vet.atencion_clinica r WHERE r.organizacion_id=$1 AND r.id=$2 AND ${scope} AND ${read}`,
      params,
    );
    if (!rows[0]) throw new NotFoundException('Atencion no disponible');
    if (author) {
      if (rows[0].estado === 'anulada')
        throw new ConflictException('Atencion anulada');
      const users: Row[] = await manager.query(
        'SELECT p.id FROM vet.profesional p JOIN vet.membresia m ON m.id=p.membresia_id AND m.organizacion_id=p.organizacion_id WHERE p.organizacion_id=$1 AND p.id=$2 AND m.usuario_id=$3 AND m.activo',
        [a.organizationId, rows[0].profesional_id, a.userId],
      );
      if (!users.length)
        throw new ForbiddenException(
          'El profesional responsable debe registrar la operacion',
        );
    }
    return rows[0];
  }
  private text(input: Row, key: string, required = false, max = 20000) {
    const value = input[key];
    if (value == null && !required) return null;
    if (
      typeof value !== 'string' ||
      value.length > max ||
      (required && !value.trim())
    )
      throw new BadRequestException(`Revise ${key}`);
    return value;
  }
  private async operation(
    manager: EntityManager,
    a: Access,
    key: string,
    hash: string,
    execute: () => Promise<Row>,
  ) {
    await manager.query(
      'SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
      [`${a.organizationId}:${a.userId}:${key}`],
    );
    const prior: { resource: string; request_hash: string; response: Row }[] =
      await manager.query(
        'SELECT resource,request_hash,response FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at>now()',
        [a.organizationId, a.userId, key],
      );
    if (prior[0]) {
      if (prior[0].resource !== 'laboratory' || prior[0].request_hash !== hash)
        throw new ConflictException('Idempotency-Key ya utilizado');
      return { data: prior[0].response };
    }
    const response = await execute();
    await manager.query(
      'DELETE FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at<=now()',
      [a.organizationId, a.userId, key],
    );
    await manager.query(
      'INSERT INTO api.idempotency(organizacion_id,usuario_id,key,resource,request_hash,response) VALUES($1,$2,$3,$4,$5,$6)',
      [
        a.organizationId,
        a.userId,
        key,
        'laboratory',
        hash,
        JSON.stringify(response),
      ],
    );
    return { data: response };
  }
  create(identity: Identity, org: string, body: unknown, key: string) {
    const input = object(body);
    if (
      Object.keys(input).some(
        (k) =>
          !['atencion_id', 'laboratorio_id', 'pruebas', 'indicacion'].includes(
            k,
          ),
      )
    )
      throw new BadRequestException('Campo no permitido');
    const attentionId = uuid(input.atencion_id),
      lab = uuid(input.laboratorio_id),
      tests = this.text(input, 'pruebas', true, 4000),
      indication = this.text(input, 'indicacion');
    const hash = createHash('sha256')
      .update(JSON.stringify({ attentionId, lab, tests, indication }))
      .digest('hex');
    return this.access.run(identity, org, async (manager, a) => {
      await this.attention(manager, a, attentionId, 'create', true);
      const params: unknown[] = [org, lab],
        scope = this.access.scopeSql(
          resource('laboratorio'),
          'r',
          this.access.authorize(a, resource('laboratorio'), 'read'),
          params,
        );
      const labs: Row[] = await manager.query(
        `SELECT r.id FROM vet.laboratorio r WHERE r.organizacion_id=$1 AND r.id=$2 AND r.activo AND ${scope}`,
        params,
      );
      if (!labs.length)
        throw new NotFoundException('Laboratorio no disponible');
      return this.operation(manager, a, key, hash, async () => {
        const rows: Row[] = await manager.query(
          'INSERT INTO vet.orden_laboratorio(organizacion_id,atencion_id,laboratorio_id,pruebas,indicacion) VALUES($1,$2,$3,$4,$5) RETURNING *',
          [org, attentionId, lab, tests, indication],
        );
        return rows[0];
      });
    });
  }
  list(identity: Identity, org: string, attentionId: string, after?: string) {
    if (after) uuid(after);
    return this.access.run(identity, org, async (manager, a) => {
      await this.attention(manager, a, attentionId, 'read');
      const orders: Row[] = await manager.query(
        'SELECT * FROM vet.orden_laboratorio WHERE organizacion_id=$1 AND atencion_id=$2 AND ($3::uuid IS NULL OR id>$3) ORDER BY id LIMIT 26',
        [org, attentionId, after ?? null],
      );
      const data = orders.slice(0, 25);
      const results: Row[] = await manager.query(
        'SELECT r.* FROM vet.resultado_laboratorio r WHERE r.organizacion_id=$1 AND r.orden_id=ANY($2::uuid[]) ORDER BY r.numero DESC',
        [org, data.map((row) => row.id)],
      );
      const map = new Map<string, Row[]>();
      for (const row of results) {
        const key = String(row.orden_id);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(row);
      }
      for (const row of data) row.resultados = map.get(String(row.id)) ?? [];
      const events: Row[] = await manager.query(
        'SELECT * FROM vet.evento_orden_laboratorio WHERE organizacion_id=$1 AND orden_id=ANY($2::uuid[]) ORDER BY creado_en DESC',
        [org, data.map((row) => row.id)],
      );
      const eventMap = new Map<string, Row[]>();
      for (const event of events) {
        const key = String(event.orden_id);
        if (!eventMap.has(key)) eventMap.set(key, []);
        eventMap.get(key)!.push(event);
      }
      for (const row of data) row.eventos = eventMap.get(String(row.id)) ?? [];

      await manager.query(
        "SELECT vet.record_api_access('orden_laboratorio',$1,'LIST')",
        [attentionId],
      );
      await manager.query(
        "SELECT vet.record_api_access('resultado_laboratorio',$1,'LIST')",
        [attentionId],
      );
      return {
        data,
        page: { limit: 25, next: orders.length > 25 ? data.at(-1)!.id : null },
      };
    });
  }
  advance(
    identity: Identity,
    org: string,
    id: string,
    body: unknown,
    key: string,
    etag: string,
  ) {
    const input = object(body),
      version = expectedVersion(etag);
    if (
      Object.keys(input).some(
        (k) =>
          ![
            'accion',
            'muestra',
            'resultado',
            'archivo_id',
            'motivo_correccion',
            'interpretacion',
            'comunicacion',
            'motivo_cancelacion',
          ].includes(k),
      )
    )
      throw new BadRequestException('Campo no permitido');
    const action = this.text(input, 'accion', true, 40);
    const hash = createHash('sha256')
      .update(JSON.stringify({ id, version, input }))
      .digest('hex');
    return this.access.run(identity, org, async (manager, a) => {
      const params: unknown[] = [org, id];
      const scope = this.scope(a, 'update', 'r', params);
      const read = this.access.scopeSql(
        resource('atencion_clinica'),
        'r',
        this.access.authorize(a, resource('atencion_clinica'), 'read'),
        params,
      );
      const orders: Row[] = await manager.query(
        `SELECT o.* FROM vet.orden_laboratorio o
         JOIN vet.atencion_clinica r ON r.organizacion_id=o.organizacion_id AND r.id=o.atencion_id
         WHERE o.organizacion_id=$1 AND o.id=$2 AND ${scope} AND ${read} FOR UPDATE OF o`,
        params,
      );
      if (!orders[0]) throw new NotFoundException('Orden no disponible');
      const order = orders[0];
      await this.attention(
        manager,
        a,
        String(order.atencion_id),
        'update',
        true,
      );
      return this.operation(manager, a, key, hash, async () => {
        if (order.version !== version)
          throw new HttpException('La orden cambio', 412);
        const state = String(order.estado);
        let sql: string;
        const values: unknown[] = [org, id];
        if (action === 'muestra' && state === 'solicitada') {
          values.push(this.text(input, 'muestra', true, 4000));
          sql = "estado='muestra_tomada',muestra=$3,tomada_en=now()";
        } else if (action === 'procesar' && state === 'muestra_tomada') {
          sql = "estado='en_proceso'";
        } else if (
          action === 'resultado' &&
          [
            'en_proceso',
            'resultado_disponible',
            'revisada',
            'comunicada',
          ].includes(state)
        ) {
          const text = this.text(input, 'resultado', true),
            reason = this.text(input, 'motivo_correccion');
          const previous: Row[] = await manager.query(
            'SELECT * FROM vet.resultado_laboratorio WHERE organizacion_id=$1 AND orden_id=$2 ORDER BY numero DESC LIMIT 1',
            [org, id],
          );
          if (previous[0] && !reason?.trim())
            throw new BadRequestException('Indique motivo de correccion');
          const file = input.archivo_id ? uuid(input.archivo_id) : null;
          if (file) {
            const allowed: Row[] = await manager.query(
              "SELECT f.id FROM vet.archivo f JOIN vet.adjunto_clinico x ON x.archivo_id=f.id AND x.organizacion_id=f.organizacion_id JOIN vet.revision_clinica v ON v.id=x.revision_id AND v.organizacion_id=x.organizacion_id WHERE f.organizacion_id=$1 AND f.id=$2 AND f.estado_analisis='disponible' AND v.atencion_id=$3",
              [org, file, order.atencion_id],
            );
            if (!allowed.length)
              throw new BadRequestException(
                'Adjunte el informe a la misma atencion',
              );
          }
          await manager.query(
            'INSERT INTO vet.resultado_laboratorio(organizacion_id,orden_id,numero,previo_id,motivo_correccion,resultado,archivo_id,creado_por) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
            [
              org,
              id,
              previous[0] ? Number(previous[0].numero) + 1 : 1,
              previous[0]?.id ?? null,
              reason,
              text,
              file,
              a.userId,
            ],
          );
          sql =
            "estado='resultado_disponible',interpretacion=NULL,revisada_en=NULL,comunicacion=NULL,comunicada_en=NULL";
        } else if (action === 'revisar' && state === 'resultado_disponible') {
          values.push(this.text(input, 'interpretacion', true));
          sql = "estado='revisada',interpretacion=$3,revisada_en=now()";
        } else if (action === 'comunicar' && state === 'revisada') {
          values.push(this.text(input, 'comunicacion', true));
          sql = "estado='comunicada',comunicacion=$3,comunicada_en=now()";
        } else if (
          action === 'cancelar' &&
          ['solicitada', 'muestra_tomada', 'en_proceso'].includes(state)
        ) {
          values.push(this.text(input, 'motivo_cancelacion', true, 4000));
          sql = "estado='cancelada',motivo_cancelacion=$3";
        } else
          throw new ConflictException('Transicion de laboratorio no permitida');
        const rows: Row[] = await manager.query(
          `WITH updated AS (UPDATE vet.orden_laboratorio SET ${sql} WHERE organizacion_id=$1 AND id=$2 RETURNING *) SELECT * FROM updated`,
          values,
        );
        return rows[0];
      });
    });
  }
}
