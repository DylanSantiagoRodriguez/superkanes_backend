import { NotFoundException } from '@nestjs/common';
import type { EntityTarget } from 'typeorm';
import { entitiesByTable, domainEntities } from '../modules/domain-entities';
import model from './resource-model.generated.json';

export type Action = 'read' | 'create' | 'update' | 'delete';
export type Row = Record<string, unknown>;
export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  enum: string[];
}
export interface ForeignKey {
  columns: string[];
  target: string;
  targetColumns: string[];
}
export interface Resource {
  name: string;
  tenant: boolean;
  mutable: boolean;
  audit: boolean;
  columns: Column[];
  refs: ForeignKey[];
  columnMap: Map<string, Column>;
  entity: EntityTarget<object>;
  create: boolean;
  update: boolean;
  deletion: 'none' | 'hard' | 'soft';
  soft?: [string, unknown];
  parent?: [string, string];
  site?: string;
  platformWrite: boolean;
}

export const serverFields = new Set([
  'id',
  'organizacion_id',
  'creado_en',
  'creado_por',
  'actualizado_en',
  'actualizado_por',
  'version',
  'cerrada_en',
  'cerrada_por',
  'emitido_por',
  'identidad_firmante_snapshot',
]);
const readOnly = new Set([
  'evento_auditoria',
  'evento_salida',
  'reporte_emitido',
]);
const appendOnly = new Set([
  'preferencia_comunicacion',
  'firma_consentimiento',
]);
const hardDelete = new Set([
  'telefono_tutor',
  'rol',
  'rol_permiso',
  'asignacion_rol',
  'seccion_clinica',
  'medicion_clinica',
  'diagnostico_atencion',
  'prescripcion_item',
  'peluqueria_item',
  'adjunto_clinico',
]);
const softDeletes: Record<string, [string, unknown]> = {
  usuario: ['activo', false],
  organizacion: ['estado', 'inactiva'],
  sede: ['activa', false],
  membresia: ['activo', false],
  tutor: ['activo', false],
  especie: ['activa', false],
  raza: ['activa', false],
  mascota: ['estado', 'inactiva'],
  alerta_mascota: ['activa', false],
  laboratorio: ['activo', false],
  medicamento: ['activo', false],
  vacuna: ['activo', false],
  tipo_servicio: ['activo', false],
  tipo_seccion_clinica: ['activo', false],
  diagnostico: ['activo', false],
  cita: ['estado', 'cancelada'],
  pendiente_vacunal: ['estado', 'cancelado'],
  recordatorio: ['estado', 'cancelado'],
  servicio_peluqueria: ['estado', 'cancelado'],
};
const parents: Record<string, [string, string]> = {
  revision_clinica: ['atencion_clinica', 'atencion_id'],
  seccion_clinica: ['revision_clinica', 'revision_id'],
  medicion_clinica: ['revision_clinica', 'revision_id'],
  diagnostico_atencion: ['revision_clinica', 'revision_id'],
  prescripcion: ['revision_clinica', 'revision_id'],
  prescripcion_item: ['prescripcion', 'prescripcion_id'],
  adjunto_clinico: ['revision_clinica', 'revision_id'],
  adjunto_vacunacion: ['vacunacion', 'vacunacion_id'],
  peluqueria_item: ['servicio_peluqueria', 'servicio_id'],
  consentimiento: ['servicio_peluqueria', 'servicio_id'],
  firma_consentimiento: ['consentimiento', 'consentimiento_id'],
  adjunto_peluqueria: ['servicio_peluqueria', 'servicio_id'],
};

export const resources: ReadonlyMap<string, Resource> = new Map(
  model.map((t) => {
    const columns = t.columns as Column[];
    const soft = softDeletes[t.name];
    const r: Resource = {
      ...t,
      columns,
      columnMap: new Map(columns.map((c) => [c.name, c])),
      entity: entitiesByTable[t.name as keyof typeof entitiesByTable],
      create: !readOnly.has(t.name),
      update: !readOnly.has(t.name) && !appendOnly.has(t.name),
      deletion: soft ? 'soft' : hardDelete.has(t.name) ? 'hard' : 'none',
      soft,
      parent: parents[t.name],
      site:
        t.name === 'sede'
          ? 'id'
          : columns.some((c) => c.name === 'sede_id') &&
              !['asignacion_rol'].includes(t.name)
            ? 'sede_id'
            : undefined,
      platformWrite: !t.tenant,
    };
    return [t.name, r];
  }),
);
export const resourceEntities = domainEntities;
const resourcesByEntity = new Map(
  [...resources.values()].map((r) => [r.entity, r]),
);
export function resourceForEntity(entity: EntityTarget<object>): Resource {
  const value = resourcesByEntity.get(entity);
  if (!value) throw new NotFoundException('Entidad no registrada');
  return value;
}
export function resource(name: string): Resource {
  const value = resources.get(name);
  if (!value) throw new NotFoundException('Recurso no disponible');
  return value;
}
export function permissionCodes(): string[] {
  return [
    'orden_laboratorio.read',
    'orden_laboratorio.create',
    'orden_laboratorio.update',
    ...[...resources.values()].flatMap((r) =>
      [
        'read',
        ...(r.create ? ['create'] : []),
        ...(r.update ? ['update'] : []),
        ...(r.deletion !== 'none' ? ['delete'] : []),
      ].map((a) => `${r.name}.${a}`),
    ),
  ];
}
