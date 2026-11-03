import { validateClinicalDocument } from './clinical-document';
import { BadRequestException, HttpException } from '@nestjs/common';
import { isEmail, isISO8601, isUUID } from 'class-validator';
import { Column, Resource, Row, serverFields } from './resource-registry';

export function object(value: unknown): Row {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new BadRequestException('Se requiere un objeto JSON');
  return value as Row;
}
export function uuid(value: unknown, label = 'id'): string {
  if (typeof value !== 'string' || !isUUID(value))
    throw new BadRequestException(`${label}: UUID invalido`);
  return value;
}
function safeJson(value: unknown, depth = 0): void {
  if (depth > 12) throw new BadRequestException('JSON demasiado profundo');
  if (value && typeof value === 'object')
    for (const [key, item] of Object.entries(value)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key))
        throw new BadRequestException('Clave JSON no permitida');
      safeJson(item, depth + 1);
    }
}
export function field(c: Column, value: unknown): unknown {
  if (value === null) {
    if (!c.nullable) throw new BadRequestException(`${c.name}: no admite null`);
    return null;
  }
  const fail = () => {
    throw new BadRequestException(`${c.name}: valor invalido`);
  };
  const type = c.type;
  if (type === 'uuid') return uuid(value, c.name);
  if (type === 'boolean') {
    if (typeof value !== 'boolean') fail();
    return value;
  }
  if (type === 'integer') {
    if (
      typeof value !== 'number' ||
      !Number.isSafeInteger(value) ||
      Math.abs(value) > 2147483647
    )
      fail();
    return value;
  }
  if (type === 'bigint') {
    if (
      typeof value !== 'string' ||
      !/^\d{1,19}$/.test(value) ||
      BigInt(value) > 9223372036854775807n
    )
      fail();
    return value;
  }
  if (type.startsWith('numeric')) {
    const match = /numeric\((\d+),(\d+)\)/.exec(type)!;
    const s =
      typeof value === 'number' && Number.isFinite(value)
        ? String(value)
        : value;
    if (
      typeof s !== 'string' ||
      !new RegExp(
        `^-?\\d{1,${Number(match[1]) - Number(match[2])}}(?:\\.\\d{1,${match[2]}})?$`,
      ).test(s)
    )
      fail();
    return s;
  }
  if (type === 'jsonb' && c.name === 'documento')
    return validateClinicalDocument(value);
  if (type === 'jsonb') {
    if (!value || typeof value !== 'object') fail();
    safeJson(value);
    if (JSON.stringify(value).length > 65536)
      throw new BadRequestException(`${c.name}: JSON demasiado grande`);
    return value;
  }
  if (typeof value !== 'string') return fail();
  if (type === 'date') {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !isISO8601(value, { strict: true })
    )
      fail();
    return value;
  }
  if (type === 'timestamptz') {
    if (
      !/(Z|[+-]\d{2}:\d{2})$/.test(value) ||
      !isISO8601(value, { strict: true, strictSeparator: true })
    )
      fail();
    return value;
  }
  if (value.includes('\0') || value.length > 20000) fail();
  const result = value.trim();
  const fixed = /^char\((\d+)\)$/.exec(type);
  if (fixed && result.length !== Number(fixed[1])) fail();
  if (!result.length && !c.nullable) fail();
  if (c.enum.length && !c.enum.includes(result)) fail();
  if (c.name === 'email' && !isEmail(result)) fail();
  if (c.name.includes('zona_horaria'))
    try {
      new Intl.DateTimeFormat('es', { timeZone: result });
    } catch {
      fail();
    }
  return result;
}
export function payload(r: Resource, body: unknown, create: boolean): Row {
  const input = object(body);
  const output: Row = {};
  if (Object.keys(input).length > 100)
    throw new BadRequestException('Demasiados campos');
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    const c = r.columnMap.get(key);
    if (!c || serverFields.has(key))
      throw new BadRequestException(`Campo no permitido: ${key}`);
    output[key] = field(c, value);
  }
  if (create)
    for (const c of r.columns) {
      if (
        !serverFields.has(c.name) &&
        !c.nullable &&
        c.default === null &&
        !(c.name in output)
      )
        throw new BadRequestException(`Campo requerido: ${c.name}`);
    }
  if (!create && !Object.keys(output).length)
    throw new BadRequestException('No hay cambios');
  return output;
}
export function expectedVersion(header: unknown): number {
  if (header === undefined)
    throw new HttpException('Se requiere If-Match con la version actual', 428);
  if (
    typeof header !== 'string' ||
    !/^(?:[1-9]\d{0,9}|"[1-9]\d{0,9}")$/.test(header)
  )
    throw new BadRequestException('If-Match invalido');
  return Number(header.replaceAll('"', ''));
}
export interface ListQuery {
  limit: number;
  cursor?: string;
  filters: Row;
}
export function listQuery(r: Resource, query: Row): ListQuery {
  if (Object.keys(query).some((k) => !['limit', 'after', 'filter'].includes(k)))
    throw new BadRequestException('Parametro de consulta no permitido');
  const raw = query.limit ?? '25';
  if (typeof raw !== 'string' || !/^\d+$/.test(raw))
    throw new BadRequestException('limit invalido');
  const limit = Number(raw);
  if (limit < 1 || limit > 100)
    throw new BadRequestException('limit debe estar entre 1 y 100');
  const cursor =
    query.after === undefined ? undefined : uuid(query.after, 'after');
  let filters: Row = {};
  if (query.filter !== undefined) {
    if (typeof query.filter !== 'string' || query.filter.length > 4096)
      throw new BadRequestException('filter invalido');
    try {
      filters = object(JSON.parse(query.filter));
    } catch {
      throw new BadRequestException('filter debe ser un objeto JSON');
    }
    if (Object.keys(filters).length > 10)
      throw new BadRequestException('Maximo 10 filtros');
    for (const [key, value] of Object.entries(filters)) {
      const c = r.columnMap.get(key);
      if (
        !c ||
        key === 'organizacion_id' ||
        c.type === 'jsonb' ||
        (serverFields.has(key) && key !== 'id')
      )
        throw new BadRequestException(`Filtro no permitido: ${key}`);
      filters[key] = field(c, value);
    }
  }
  return { limit, cursor, filters };
}
