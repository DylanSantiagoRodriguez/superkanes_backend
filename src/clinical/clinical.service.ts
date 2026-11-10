import { createHash } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import type { Identity } from '../auth/token.service';
import {
  Access,
  ResourceAccessService,
} from '../resources/resource-access.service';
import { resource, Row } from '../resources/resource-registry';
import { uuid, object, field } from '../resources/resource-validation';
import { ClinicalQueryDto } from './clinical-query.dto';

const sections: Record<
  string,
  { table: string; date: string; filter?: string }
> = {
  alertas: {
    table: 'alerta_mascota',
    date: 'detectada_en',
    filter: 'r.activa',
  },
  consultas: { table: 'atencion_clinica', date: 'fecha_atencion' },
  revisiones: { table: 'revision_clinica', date: 'creado_en' },
  mediciones: { table: 'medicion_clinica', date: 'medida_en' },
  peso: {
    table: 'medicion_clinica',
    date: 'medida_en',
    filter: "r.tipo='peso' AND r.unidad='kg'",
  },
  diagnosticos: { table: 'diagnostico_atencion', date: 'creado_en' },
  tratamientos: { table: 'prescripcion_item', date: 'creado_en' },
  vacunas: { table: 'vacunacion', date: 'aplicada_en' },
  consentimientos: {
    table: 'consentimiento',
    date: 'emitido_en',
    filter: 'r.atencion_id IS NOT NULL',
  },
  reportes: { table: 'reporte_emitido', date: 'emitido_en' },
  documentos: { table: 'adjunto_clinico', date: 'creado_en' },
  citas: { table: 'cita', date: 'inicio' },
  controles: {
    table: 'cita',
    date: 'inicio',
    filter: "r.estado IN ('programada','confirmada','en_atencion')",
  },
  pendientes: {
    table: 'pendiente_vacunal',
    date: 'fecha_objetivo',
    filter: "r.estado='pendiente'",
  },
};

@Injectable()
export class ClinicalService {
  constructor(private readonly access: ResourceAccessService) {}

  private scope(a: Access, table: string, alias: string, params: unknown[]) {
    const r = resource(table);
    return this.access.scopeSql(
      r,
      alias,
      this.access.authorize(a, r, 'read'),
      params,
    );
  }

  private async patient(manager: EntityManager, a: Access, id: string) {
    const params: unknown[] = [a.organizationId, id];
    const scope = this.scope(a, 'mascota', 'r', params);
    const rows: Row[] = await manager.query(
      `SELECT r.* FROM vet.mascota r WHERE r.organizacion_id=$1 AND r.id=$2 AND ${scope}`,
      params,
    );
    if (!rows[0]) throw new NotFoundException('Paciente no disponible');
    await manager.query("SELECT vet.record_api_access('mascota',$1,'READ')", [
      id,
    ]);
    return rows[0];
  }

  private async optional<T>(operation: () => Promise<T>): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof ForbiddenException) return null;
      throw error;
    }
  }

  summary(identity: Identity, org: string, id: string) {
    return this.access.run(identity, org, async (manager, a) => {
      const patient = await this.patient(manager, a, id);
      const related = async (table: string, relatedId: unknown) => {
        if (!relatedId) return null;
        return this.optional(async () => {
          const params: unknown[] = [org, relatedId];
          const scope = this.scope(a, table, 'r', params);
          const rows: Row[] = await manager.query(
            `SELECT r.* FROM vet."${table}" r WHERE r.organizacion_id=$1 AND r.id=$2 AND ${scope}`,
            params,
          );
          if (rows[0])
            await manager.query('SELECT vet.record_api_access($1,$2,$3)', [
              table,
              relatedId,
              'READ',
            ]);
          return rows[0] ?? null;
        });
      };
      const species = await related('especie', patient.especie_id);
      const breed = await related('raza', patient.raza_id);
      const guardian = await this.optional(async () => {
        const params: unknown[] = [org, id];
        const linkScope = this.scope(a, 'mascota_tutor', 'l', params);
        const tutorScope = this.scope(a, 'tutor', 'r', params);
        const rows: Row[] = await manager.query(
          `SELECT r.* FROM vet.tutor r JOIN vet.mascota_tutor l ON l.tutor_id=r.id AND l.organizacion_id=r.organizacion_id WHERE l.organizacion_id=$1 AND l.mascota_id=$2 AND l.es_principal AND l.vigente_hasta IS NULL AND ${linkScope} AND ${tutorScope}`,
          params,
        );
        if (rows[0]) {
          await manager.query(
            "SELECT vet.record_api_access('tutor',$1,'READ')",
            [rows[0].id],
          );
          await manager.query(
            "SELECT vet.record_api_access('mascota_tutor',$1,'LIST')",
            [id],
          );
        }
        return rows[0] ?? null;
      });
      const overview: Record<string, unknown> = {};
      for (const section of [
        'alertas',
        'peso',
        'revisiones',
        'vacunas',
        'controles',
        'pendientes',
      ])
        overview[section] = await this.optional(() =>
          this.rows(manager, a, id, section, {
            limit: section === 'peso' ? '1' : '5',
          }),
        );
      return { data: { patient, species, breed, guardian, overview } };
    });
  }

  list(
    identity: Identity,
    org: string,
    id: string,
    section: string,
    query: ClinicalQueryDto,
  ) {
    return this.access.run(identity, org, async (manager, a) => {
      await this.patient(manager, a, id);
      return section === 'historia'
        ? this.timeline(manager, a, id, query)
        : this.rows(manager, a, id, section, query);
    });
  }

  saveWeight(
    identity: Identity,
    org: string,
    id: string,
    body: unknown,
    key: string,
  ) {
    const input = object(body);
    if (
      Object.keys(input).some(
        (k) =>
          !['valor', 'medida_en', 'sede_id', 'cita_id', 'notas'].includes(k),
      )
    )
      throw new BadRequestException('Campo no permitido');
    const valor = field(
      {
        name: 'valor',
        type: 'numeric(8,3)',
        nullable: false,
        default: null,
        enum: [],
      },
      input.valor,
    );
    if (Number(valor) <= 0)
      throw new BadRequestException('El peso debe ser positivo');
    const medida = field(
      resource('medicion_clinica').columnMap.get('medida_en')!,
      input.medida_en,
    );
    if (Date.parse(String(medida)) > Date.now() + 60000)
      throw new BadRequestException('El pesaje no puede ser futuro');
    const site = uuid(input.sede_id, 'sede_id');
    const appointment = input.cita_id ? uuid(input.cita_id, 'cita_id') : null;
    if (
      input.notas !== undefined &&
      (typeof input.notas !== 'string' ||
        input.notas.length > 2000 ||
        input.notas.includes('\0'))
    )
      throw new BadRequestException('Notas no validas');
    const notes = typeof input.notas === 'string' ? input.notas.trim() : null;
    const hash = createHash('sha256')
      .update(JSON.stringify([id, valor, medida, site, appointment, notes]))
      .digest('hex');
    return this.access.run(identity, org, async (manager, a) => {
      await this.patient(manager, a, id);
      const grants = this.access.authorize(
        a,
        resource('medicion_clinica'),
        'create',
      );
      if (!grants.has(null) && !grants.has(site))
        throw new ForbiddenException('Sede fuera de alcance');
      const params: unknown[] = [org, site];
      const siteScope = this.scope(a, 'sede', 'r', params);
      const sites: Row[] = await manager.query(
        `SELECT r.id FROM vet.sede r WHERE r.organizacion_id=$1 AND r.id=$2 AND ${siteScope}`,
        params,
      );
      if (!sites.length) throw new NotFoundException('Sede no disponible');
      if (appointment) {
        const values: unknown[] = [org, appointment, id, site];
        const scope = this.scope(a, 'cita', 'r', values);
        const linked: Row[] = await manager.query(
          `SELECT r.id FROM vet.cita r WHERE r.organizacion_id=$1 AND r.id=$2 AND r.mascota_id=$3 AND r.sede_id=$4 AND ${scope}`,
          values,
        );
        if (!linked.length)
          throw new NotFoundException(
            'Cita no disponible para este paciente y sede',
          );
      }
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
        [`${org}:${a.userId}:${key}`],
      );
      const prior: Row[] = await manager.query(
        'SELECT resource,request_hash,response FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at>now()',
        [org, a.userId, key],
      );
      if (prior[0]) {
        if (
          prior[0].resource !== 'patient-weight' ||
          prior[0].request_hash !== hash
        )
          throw new ConflictException('Idempotency-Key ya utilizado');
        return { data: prior[0].response };
      }
      const [saved]: Row[] = await manager.query(
        'INSERT INTO vet.peso_mascota(organizacion_id,mascota_id,sede_id,cita_id,valor,medida_en,notas,creado_por) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
        [org, id, site, appointment, valor, medida, notes, a.userId],
      );
      await manager.query(
        'DELETE FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at<=now()',
        [org, a.userId, key],
      );
      await manager.query(
        'INSERT INTO api.idempotency(organizacion_id,usuario_id,key,resource,request_hash,response) VALUES($1,$2,$3,$4,$5,$6)',
        [org, a.userId, key, 'patient-weight', hash, JSON.stringify(saved)],
      );
      return { data: saved };
    });
  }

  private async weights(
    manager: EntityManager,
    a: Access,
    id: string,
    query: ClinicalQueryDto,
  ) {
    const params: unknown[] = [a.organizationId, id];
    const grants = this.access.authorize(
      a,
      resource('medicion_clinica'),
      'read',
    );
    const clinicalScope = this.access.scopeSql(
      resource('medicion_clinica'),
      'm',
      grants,
      params,
    );
    // Standalone observations use the same measurement grants, scoped by their site.
    const manualScope = this.access.scopeSql(
      resource('atencion_clinica'),
      'w',
      grants,
      params,
    );
    const sql = `SELECT w.id,w.valor,w.medida_en,w.medida_en AS fecha,'peso'::text AS tipo,'kg'::text AS unidad,
      'peso_mascota'::text AS tipo_evento,NULL::uuid AS atencion_id,w.cita_id,w.notas,to_jsonb(w)::text AS busqueda
      FROM vet.peso_mascota w WHERE w.organizacion_id=$1 AND w.mascota_id=$2 AND ${manualScope}
      UNION ALL SELECT m.id,m.valor,m.medida_en,m.medida_en AS fecha,'peso','kg','medicion_clinica',c.id,c.cita_id,NULL::text,to_jsonb(m)::text
      FROM vet.medicion_clinica m JOIN vet.revision_clinica v ON v.id=m.revision_id AND v.organizacion_id=m.organizacion_id
      JOIN vet.atencion_clinica c ON c.id=v.atencion_id AND c.organizacion_id=v.organizacion_id
      WHERE m.organizacion_id=$1 AND c.mascota_id=$2 AND m.tipo='peso' AND m.unidad='kg' AND c.estado<>'anulada'
      AND v.numero=(SELECT max(v2.numero) FROM vet.revision_clinica v2 WHERE v2.organizacion_id=v.organizacion_id AND v2.atencion_id=v.atencion_id)
      AND ${clinicalScope}`;
    const result = await this.page(manager, sql, params, query);
    await manager.query(
      "SELECT vet.record_api_access('medicion_clinica',$1,'LIST')",
      [id],
    );
    await manager.query(
      "SELECT vet.record_api_access('peso_mascota',$1,'LIST')",
      [id],
    );
    return result;
  }

  details(identity: Identity, org: string, id: string) {
    return this.access.run(identity, org, async (manager, a) => {
      const params: unknown[] = [org, id];
      const scope = this.scope(a, 'revision_clinica', 'r', params);
      const rows: Row[] = await manager.query(
        `SELECT r.* FROM vet.revision_clinica r WHERE r.organizacion_id=$1 AND r.id=$2 AND ${scope}`,
        params,
      );
      if (!rows[0]) throw new NotFoundException('Revision no disponible');
      const details: Record<string, unknown> = {};
      for (const name of [
        'medicion_clinica',
        'diagnostico_atencion',
        'seccion_clinica',
        'prescripcion',
        'prescripcion_item',
        'adjunto_clinico',
      ]) {
        details[name] = await this.optional(async () => {
          const values: unknown[] = [org, id];
          const detailScope = this.scope(a, name, 'r', values);
          const from =
            name === 'prescripcion_item'
              ? 'vet.prescripcion_item r JOIN vet.prescripcion p ON p.id=r.prescripcion_id AND p.organizacion_id=r.organizacion_id'
              : `vet."${name}" r`;
          const relation =
            name === 'prescripcion_item' ? 'p.revision_id' : 'r.revision_id';
          const records: Row[] = await manager.query(
            `SELECT r.* FROM ${from} WHERE r.organizacion_id=$1 AND ${relation}=$2 AND ${detailScope} ORDER BY r.creado_en,r.id LIMIT 1001`,
            values,
          );
          await manager.query('SELECT vet.record_api_access($1,$2,$3)', [
            name,
            id,
            'LIST',
          ]);
          await this.enrich(manager, a, name, records.slice(0, 1000));
          return {
            data: records.slice(0, 1000),
            has_more: records.length > 1000,
          };
        });
      }
      await manager.query(
        "SELECT vet.record_api_access('revision_clinica',$1,'READ')",
        [id],
      );
      return { data: { revision: rows[0], details } };
    });
  }

  private async enrich(
    manager: EntityManager,
    a: Access,
    table: string,
    rows: Row[],
  ) {
    if (!rows.length) return;
    const targets: [string, string, string][] =
      table === 'adjunto_clinico'
        ? [['archivo', 'archivo_id', 'nombre_original']]
        : table === 'diagnostico_atencion'
          ? [['diagnostico', 'diagnostico_id', 'nombre']]
          : table === 'atencion_clinica'
            ? [['profesional', 'profesional_id', 'nombre_profesional']]
            : [];
    for (const [target, key, label] of targets) {
      await this.optional(async () => {
        const params: unknown[] = [
          a.organizationId,
          rows.map((row) => row[key]),
        ];
        const scope = this.scope(a, target, 'r', params);
        const names: Row[] = await manager.query(
          `SELECT r.id,r."${label}" FROM vet."${target}" r WHERE r.organizacion_id=$1 AND r.id=ANY($2::uuid[]) AND ${scope}`,
          params,
        );
        const map = new Map(names.map((row) => [row.id, row[label]]));
        for (const row of rows) row[label] = map.get(row[key]) ?? null;
        await manager.query('SELECT vet.record_api_access($1,$2,$3)', [
          target,
          a.requestId,
          'LIST',
        ]);
      });
    }
    if (table === 'atencion_clinica')
      await this.optional(async () => {
        const params: unknown[] = [a.organizationId, rows.map((row) => row.id)];
        const scope = this.scope(a, 'revision_clinica', 'r', params);
        const revisions: Row[] = await manager.query(
          `SELECT DISTINCT ON(r.atencion_id) r.atencion_id,r.motivo_consulta FROM vet.revision_clinica r WHERE r.organizacion_id=$1 AND r.atencion_id=ANY($2::uuid[]) AND ${scope} ORDER BY r.atencion_id,r.numero DESC`,
          params,
        );
        const map = new Map(
          revisions.map((row) => [row.atencion_id, row.motivo_consulta]),
        );
        for (const row of rows) row.motivo_consulta = map.get(row.id) ?? null;
        await manager.query(
          "SELECT vet.record_api_access('revision_clinica',$1,'LIST')",
          [a.requestId],
        );
      });
  }

  agenda(identity: Identity, org: string, query: ClinicalQueryDto) {
    if (
      !query.from ||
      !query.to ||
      Date.parse(query.to) - Date.parse(query.from) > 31 * 86400000
    )
      throw new BadRequestException('Seleccione un intervalo de hasta 31 dias');
    return this.access.run(identity, org, async (manager, a) => {
      const params: unknown[] = [org],
        scope = this.scope(a, 'cita', 'r', params);
      const filters = [scope];
      if (query.site) {
        params.push(query.site);
        filters.push(`r.sede_id=$${params.length}`);
      }
      if (query.responsible) {
        params.push(query.responsible);
        filters.push(`r.responsable_id=$${params.length}`);
      }
      const result = await this.page(
        manager,
        `SELECT r.*,r.inicio AS fecha,'cita'::text AS tipo_evento,to_jsonb(r)::text AS busqueda FROM vet.cita r WHERE r.organizacion_id=$1 AND ${filters.join(' AND ')}`,
        params,
        query,
      );
      const ids = result.data.map((row) => row.mascota_id);
      await this.optional(async () => {
        const values: unknown[] = [org, ids],
          petScope = this.scope(a, 'mascota', 'r', values);
        const pets: Row[] = await manager.query(
          `SELECT r.id,r.nombre,r.codigo FROM vet.mascota r WHERE r.organizacion_id=$1 AND r.id=ANY($2::uuid[]) AND ${petScope}`,
          values,
        );
        const names = new Map(pets.map((row) => [row.id, row]));
        for (const row of result.data) {
          row.nombre_paciente = names.get(row.mascota_id)?.nombre;
          row.codigo_paciente = names.get(row.mascota_id)?.codigo;
        }
        await manager.query(
          "SELECT vet.record_api_access('mascota',$1,'LIST')",
          [a.requestId],
        );
      });
      await manager.query("SELECT vet.record_api_access('cita',$1,'LIST')", [
        a.requestId,
      ]);
      return result;
    });
  }

  private options(query: ClinicalQueryDto) {
    const limit = Number(query.limit ?? 25);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new BadRequestException('Limite entre 1 y 100');
    if (query.from && query.to && new Date(query.from) > new Date(query.to))
      throw new BadRequestException('Intervalo de fechas invalido');
    let after: { date: string; id: string; type: string } | undefined;
    if (query.after) {
      try {
        const parsed: unknown = JSON.parse(
          Buffer.from(query.after, 'base64url').toString(),
        );
        if (!parsed || typeof parsed !== 'object') throw new Error();
        const value = parsed as Record<string, unknown>;
        if (
          typeof value.date !== 'string' ||
          !Number.isFinite(Date.parse(value.date)) ||
          typeof value.type !== 'string' ||
          value.type.length > 50
        )
          throw new Error();
        after = { date: value.date, id: uuid(value.id), type: value.type };
      } catch {
        throw new BadRequestException('Cursor invalido');
      }
    }
    return { limit, after };
  }

  private async page(
    manager: EntityManager,
    sql: string,
    params: unknown[],
    query: ClinicalQueryDto,
  ) {
    const { limit, after } = this.options(query);
    const conditions = ['TRUE'];
    if (after) {
      params.push(after.date, after.id, after.type);
      conditions.push(
        `(e.fecha,e.id,e.tipo_evento)<($${params.length - 2}::timestamptz,$${params.length - 1}::uuid,$${params.length}::text)`,
      );
    }
    if (query.from) {
      params.push(query.from);
      conditions.push(`e.fecha>=$${params.length}::timestamptz`);
    }
    if (query.to) {
      params.push(query.to);
      conditions.push(`e.fecha<=$${params.length}::timestamptz`);
    }
    if (query.search?.trim()) {
      params.push(`%${query.search.trim().replace(/[\\%_]/g, '\\$&')}%`);
      conditions.push(`e.busqueda ILIKE $${params.length}`);
    }
    params.push(limit + 1);
    const rows: Row[] = await manager.query(
      `SELECT e.*,to_char(e.fecha AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_fecha FROM (${sql}) e WHERE ${conditions.join(' AND ')} ORDER BY e.fecha DESC,e.id DESC,e.tipo_evento DESC LIMIT $${params.length}`,
      params,
    );
    const data = rows
      .slice(0, limit)
      .map(({ busqueda: _search, cursor_fecha: _cursor, ...row }) => {
        void _cursor;
        void _search;
        return row;
      });
    const last = data.at(-1);
    const next =
      rows.length > limit && last
        ? Buffer.from(
            JSON.stringify({
              date: rows[limit - 1].cursor_fecha,
              id: last.id,
              type: last.tipo_evento,
            }),
          ).toString('base64url')
        : null;
    return { data, page: { limit, next } };
  }

  private async rows(
    manager: EntityManager,
    a: Access,
    id: string,
    section: string,
    query: ClinicalQueryDto,
  ) {
    if (section === 'peso') return this.weights(manager, a, id, query);
    const definition = sections[section];
    if (!definition) throw new NotFoundException('Seccion no disponible');
    const params: unknown[] = [a.organizationId, id];
    let scope = this.scope(a, definition.table, 'r', params);
    if (definition.table === 'reporte_emitido') {
      const revisionScope = this.scope(a, 'revision_clinica', 'v', params);
      scope += ` AND EXISTS(SELECT 1 FROM vet.revision_clinica v WHERE v.organizacion_id=r.organizacion_id AND v.id::text=r.parametros->>'revision_id' AND ${revisionScope})`;
    }
    let table = resource(definition.table),
      alias = 'r',
      joins = '',
      depth = 0;
    const metadata: string[] = [];
    while (!table.columnMap.has('mascota_id')) {
      if (!table.parent) throw new BadRequestException('Seccion sin paciente');
      const [parent, key] =
        table.name === 'consentimiento'
          ? ['atencion_clinica', 'atencion_id']
          : table.parent;
      const next = `p${++depth}`;
      joins += ` JOIN vet."${parent}" ${next} ON ${next}.id=${alias}."${key}" AND ${next}.organizacion_id=${alias}.organizacion_id`;
      table = resource(parent);
      alias = next;
      if (parent === 'revision_clinica')
        metadata.push(
          `${alias}.numero AS numero_revision,${alias}.estado AS estado_revision,${alias}.atencion_id`,
        );
    }
    const sql = `SELECT r.*,r."${definition.date}"::timestamptz AS fecha,'${definition.table}'::text AS tipo_evento,to_jsonb(r)::text AS busqueda${metadata.length ? ',' + metadata.join(',') : ''} FROM vet."${definition.table}" r${joins} WHERE r.organizacion_id=$1 AND ${alias}.mascota_id=$2 AND ${scope}${definition.filter ? ' AND ' + definition.filter : ''}`;
    const result = await this.page(manager, sql, params, query);
    await this.enrich(manager, a, definition.table, result.data);
    await manager.query('SELECT vet.record_api_access($1,$2,$3)', [
      definition.table,
      id,
      'LIST',
    ]);
    return result;
  }

  private async timeline(
    manager: EntityManager,
    a: Access,
    id: string,
    query: ClinicalQueryDto,
  ) {
    const params: unknown[] = [a.organizationId, id];
    const branches: string[] = [],
      unavailable: string[] = [];
    for (const [type, table] of [
      ['clinica', 'atencion_clinica'],
      ['vacunacion', 'vacunacion'],
      ['peluqueria', 'servicio_peluqueria'],
    ]) {
      if (query.type && query.type !== type) continue;
      try {
        const scope = this.scope(a, table, 'r', params);
        branches.push(
          `SELECT h.registro_id AS id,h.fecha,h.tipo AS tipo_evento,h.estado,to_jsonb(r) AS registro,to_jsonb(r)::text AS busqueda FROM vet.historial_mascota h JOIN vet."${table}" r ON r.id=h.registro_id AND r.organizacion_id=h.organizacion_id WHERE h.organizacion_id=$1 AND h.mascota_id=$2 AND h.tipo='${type}' AND ${scope}`,
        );
        await manager.query('SELECT vet.record_api_access($1,$2,$3)', [
          table,
          id,
          'LIST',
        ]);
      } catch (error) {
        if (error instanceof ForbiddenException) unavailable.push(type);
        else throw error;
      }
    }

    if (!query.type || query.type === 'cita') {
      try {
        const scope = this.scope(a, 'cita', 'r', params);
        branches.push(
          `SELECT r.id,r.inicio AS fecha,'cita'::text AS tipo_evento,r.estado,to_jsonb(r) AS registro,to_jsonb(r)::text AS busqueda FROM vet.cita r WHERE r.organizacion_id=$1 AND r.mascota_id=$2 AND ${scope}`,
        );
        await manager.query("SELECT vet.record_api_access('cita',$1,'LIST')", [
          id,
        ]);
      } catch (error) {
        if (error instanceof ForbiddenException) unavailable.push('cita');
        else throw error;
      }
    }
    if (!query.type || query.type === 'laboratorio') {
      try {
        const grants = a.permissions.get('orden_laboratorio.read');
        if (!grants?.size) throw new ForbiddenException();
        const labScope = this.access.scopeSql(
          resource('atencion_clinica'),
          'at',
          grants,
          params,
        );
        const attentionScope = this.scope(a, 'atencion_clinica', 'at', params);
        branches.push(
          `SELECT h.registro_id AS id,h.fecha,h.tipo AS tipo_evento,h.estado,to_jsonb(r) AS registro,to_jsonb(r)::text AS busqueda FROM vet.historial_mascota h JOIN vet.orden_laboratorio r ON r.id=h.registro_id AND r.organizacion_id=h.organizacion_id JOIN vet.atencion_clinica at ON at.id=r.atencion_id AND at.organizacion_id=r.organizacion_id WHERE h.organizacion_id=$1 AND h.mascota_id=$2 AND h.tipo='laboratorio' AND ${labScope} AND ${attentionScope}`,
        );
        await manager.query(
          "SELECT vet.record_api_access('orden_laboratorio',$1,'LIST')",
          [id],
        );
      } catch (error) {
        if (error instanceof ForbiddenException)
          unavailable.push('laboratorio');
        else throw error;
      }
    }
    if (!branches.length)
      throw new ForbiddenException('Sin permiso de lectura para estos eventos');
    return {
      ...(await this.page(
        manager,
        branches.join(' UNION ALL '),
        params,
        query,
      )),
      unavailable,
    };
  }
}
