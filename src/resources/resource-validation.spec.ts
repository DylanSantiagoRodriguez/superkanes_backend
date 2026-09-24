import { resources, resource } from './resource-registry';
import { getMetadataArgsStorage } from 'typeorm';
import {
  expectedVersion,
  field,
  listQuery,
  payload,
} from './resource-validation';

describe('Contratos de los 47 recursos', () => {
  it('cada tabla dispone de una entidad decorada sin sincronizacion', () => {
    expect(resources.size).toBe(47);
    for (const r of resources.values()) {
      const table = getMetadataArgsStorage().tables.find(
        (t) => t.target === r.entity,
      );
      expect(table?.synchronize).toBe(false);
      expect(table?.name).toBe(r.name);
      for (const ref of r.refs) {
        const target = resource(ref.target);
        for (const name of ref.targetColumns)
          expect(target.columnMap.has(name)).toBe(true);
      }
    }
  });
  it('rechaza asignacion masiva de organizacion, autor e id', () => {
    for (const key of ['organizacion_id', 'creado_por', 'id', 'version'])
      expect(() =>
        payload(resource('tutor'), { [key]: 'bad' }, false),
      ).toThrow();
  });
  it('rechaza datos desconocidos, fechas inexistentes y UUID mal formados', () => {
    expect(() => payload(resource('tutor'), { root: true }, false)).toThrow();
    expect(() =>
      field(
        resource('mascota').columnMap.get('fecha_nacimiento')!,
        '2026-02-30',
      ),
    ).toThrow();
    expect(() =>
      field(resource('mascota').columnMap.get('raza_id')!, '1;drop'),
    ).toThrow();
  });
  it('limita paginacion, filtros y evita operadores SQL aportados por cliente', () => {
    expect(() => listQuery(resource('tutor'), { limit: '1000' })).toThrow();
    expect(() =>
      listQuery(resource('tutor'), { filter: '{"id;DELETE":1}' }),
    ).toThrow();
    expect(() => listQuery(resource('tutor'), { order: 'id desc' })).toThrow();
  });
  it('requiere control de version y conserva decimales exactos', () => {
    expect(() => expectedVersion(undefined)).toThrow();
    expect(expectedVersion('"2"')).toBe(2);
    expect(
      field(resource('vacunacion').columnMap.get('peso_kg')!, '12.345'),
    ).toBe('12.345');
    expect(() =>
      field(resource('vacunacion').columnMap.get('peso_kg')!, '12.3456'),
    ).toThrow();
  });
  it('los registros de evidencia y del sistema no permiten CRUD destructivo', () => {
    for (const name of [
      'firma_consentimiento',
      'evento_auditoria',
      'reporte_emitido',
      'evento_salida',
    ]) {
      expect(resource(name).update).toBe(false);
      expect(resource(name).deletion).toBe('none');
    }
  });
});
