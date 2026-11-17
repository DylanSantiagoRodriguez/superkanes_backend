import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Identity } from '../auth/token.service';
import { ResourceAccessService } from '../resources/resource-access.service';
import { resource, Row } from '../resources/resource-registry';
import { uuid } from '../resources/resource-validation';
import { CalendarQueryDto } from './calendar-query.dto';

// Only scheduled resources: clinical entries and administered treatments are history.
const sources = [
  {
    table: 'cita',
    date: 'inicio',
    end: 'r.fin',
    allDay: false,
    pet: 'r.mascota_id',
    title:
      "CASE r.tipo WHEN 'clinica' THEN 'Consulta / control' WHEN 'vacunacion' THEN 'Cita de vacunación' ELSE 'Cita de peluquería' END",
    detail: "COALESCE(r.notas,'')",
  },
  {
    table: 'pendiente_vacunal',
    date: 'fecha_objetivo',
    end: 'NULL::timestamptz',
    allDay: true,
    pet: 'r.mascota_id',
    title: "'Pendiente vacunal'",
    detail: 'r.indicacion',
  },
  {
    table: 'servicio_peluqueria',
    date: 'fecha_servicio',
    end: 'NULL::timestamptz',
    allDay: true,
    pet: 'r.mascota_id',
    title: "'Servicio de peluquería'",
    detail: "COALESCE(r.observaciones_ingreso,'')",
  },
  {
    table: 'recordatorio',
    date: 'programado_en',
    end: 'NULL::timestamptz',
    allDay: false,
    pet: 'NULL::uuid',
    title: "'Recordatorio · ' || r.canal",
    detail: "'Recordatorio programado'",
  },
];

@Injectable()
export class CalendarService {
  constructor(private readonly access: ResourceAccessService) {}

  list(identity: Identity, org: string, query: CalendarQueryDto) {
    const days = (Date.parse(query.to) - Date.parse(query.from)) / 86400000;
    const limit = Number(query.limit ?? 100);
    if (!Number.isFinite(days) || days < 0 || days > 41)
      throw new BadRequestException('Seleccione un intervalo de hasta 42 días');
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new BadRequestException('Límite entre 1 y 100');
    try {
      new Intl.DateTimeFormat('es', { timeZone: query.timeZone });
    } catch {
      throw new BadRequestException('Zona horaria no válida');
    }
    let after: { date: string; id: string; source: string } | undefined;
    if (query.after) {
      try {
        const value = JSON.parse(
          Buffer.from(query.after, 'base64url').toString(),
        ) as Record<string, unknown>;
        if (
          typeof value.date !== 'string' ||
          !Number.isFinite(Date.parse(value.date)) ||
          !sources.some((s) => s.table === value.source)
        )
          throw new Error();
        after = {
          date: value.date,
          id: uuid(value.id),
          source: String(value.source),
        };
      } catch {
        throw new BadRequestException('Cursor no válido');
      }
    }
    return this.access.run(identity, org, async (manager, a) => {
      const params: unknown[] = [org, query.timeZone, query.from, query.to];
      const branches: string[] = [],
        unavailable: string[] = [];
      for (const source of sources) {
        const r = resource(source.table);
        let scope: string;
        try {
          scope = this.access.scopeSql(
            r,
            'r',
            this.access.authorize(a, r, 'read'),
            params,
          );
        } catch (error) {
          if (!(error instanceof ForbiddenException)) throw error;
          unavailable.push(source.table);
          continue;
        }
        const start = source.allDay
          ? `(r.${source.date}::timestamp AT TIME ZONE $2)`
          : `r.${source.date}`;
        // Include appointments crossing midnight; date-only tasks keep their calendar date.
        const overlaps =
          source.table === 'cita'
            ? `(r.fin > ($3::date::timestamp AT TIME ZONE $2) OR (r.fin IS NULL AND r.inicio >= ($3::date::timestamp AT TIME ZONE $2)))`
            : `${start} >= ($3::date::timestamp AT TIME ZONE $2)`;
        branches.push(
          `SELECT r.id,'${source.table}'::text AS resource,${start} AS fecha,${source.end} AS fin,${source.allDay} AS all_day,${source.pet} AS mascota_id,r.estado AS status,${source.title}::text AS title,${source.detail} AS detail FROM vet.${source.table} r WHERE r.organizacion_id=$1 AND ${scope} AND ${overlaps} AND ${start} < (($4::date + 1)::timestamp AT TIME ZONE $2)`,
        );
        await manager.query('SELECT vet.record_api_access($1,$2,$3)', [
          source.table,
          a.requestId,
          'LIST',
        ]);
      }
      if (!branches.length)
        throw new ForbiddenException('Sin acceso al calendario');
      let cursor = 'TRUE';
      if (after) {
        params.push(after.date, after.id, after.source);
        cursor = `(e.fecha,e.id,e.resource) > ($${params.length - 2}::timestamptz,$${params.length - 1}::uuid,$${params.length}::text)`;
      }
      params.push(limit + 1);
      const rows: Row[] = await manager.query(
        `SELECT e.*,to_char(e.fecha AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_date,to_char(e.fecha AT TIME ZONE $2,'YYYY-MM-DD') AS day FROM (${branches.join(' UNION ALL ')}) e WHERE ${cursor} ORDER BY e.fecha,e.id,e.resource LIMIT $${params.length}`,
        params,
      );
      const visible = rows.slice(0, limit);
      const pets = new Map<unknown, unknown>();
      const values: unknown[] = [
        org,
        visible.map((r) => r.mascota_id).filter(Boolean),
      ];
      let petScope: string | undefined;
      try {
        petScope = this.access.scopeSql(
          resource('mascota'),
          'p',
          this.access.authorize(a, resource('mascota'), 'read'),
          values,
        );
      } catch (error) {
        if (!(error instanceof ForbiddenException)) throw error;
      }
      if (petScope && (values[1] as unknown[]).length) {
        const names: Row[] = await manager.query(
          `SELECT p.id,p.nombre FROM vet.mascota p WHERE p.organizacion_id=$1 AND p.id=ANY($2::uuid[]) AND ${petScope}`,
          values,
        );
        for (const pet of names) pets.set(pet.id, pet.nombre);
        await manager.query(
          "SELECT vet.record_api_access('mascota',$1,'LIST')",
          [a.requestId],
        );
      }
      const last = visible.at(-1);
      return {
        data: visible.map((r) => ({
          id: r.id,
          resource: r.resource,
          start: r.all_day ? r.day : r.fecha,
          end: r.fin,
          allDay: r.all_day,
          status: r.status,
          title: r.title,
          detail: r.detail,
          petId: r.mascota_id,
          petName: pets.get(r.mascota_id) ?? null,
        })),
        page: {
          limit,
          next:
            rows.length > limit && last
              ? Buffer.from(
                  JSON.stringify({
                    date: last.cursor_date,
                    id: last.id,
                    source: last.resource,
                  }),
                ).toString('base64url')
              : null,
        },
        unavailable,
      };
    });
  }
}
