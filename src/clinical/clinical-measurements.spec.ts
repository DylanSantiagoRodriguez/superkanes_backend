import { validateMeasurement } from './clinical-measurements';
describe('Unidades de medición clínica', () => {
  it('conserva unidades controladas sin aplicar recomendaciones clínicas', () => {
    expect(() =>
      validateMeasurement({ tipo: 'peso', valor: '12.5', unidad: 'kg' }),
    ).not.toThrow();
    expect(() =>
      validateMeasurement({ tipo: 'peso', valor: '12.5', unidad: 'lb' }),
    ).toThrow();
    expect(() =>
      validateMeasurement({ tipo: 'temperatura', valor: '38', unidad: '°C' }),
    ).not.toThrow();
    expect(() =>
      validateMeasurement({
        tipo: 'frecuencia_cardiaca',
        valor: '0',
        unidad: 'lpm',
      }),
    ).toThrow();
    expect(() =>
      validateMeasurement({
        tipo: 'condicion_corporal',
        valor: '10',
        unidad: '/9',
      }),
    ).toThrow();
  });
});
