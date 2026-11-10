import { BadRequestException } from '@nestjs/common';
export const measurementUnits: Record<string, string> = {
  peso: 'kg',
  temperatura: '°C',
  frecuencia_cardiaca: 'lpm',
  frecuencia_respiratoria: 'rpm',
  llenado_capilar: 's',
  condicion_corporal: '/9',
};
export function validateMeasurement(data: Record<string, unknown>) {
  const unit = measurementUnits[String(data.tipo)];
  if (
    unit &&
    (data.unidad !== unit ||
      !Number.isFinite(Number(data.valor)) ||
      Number(data.valor) <= 0)
  )
    throw new BadRequestException(
      'Revise el valor positivo y la unidad de la medicion',
    );
  if (
    data.tipo === 'condicion_corporal' &&
    (!Number.isInteger(Number(data.valor)) || Number(data.valor) > 9)
  )
    throw new BadRequestException('Condicion corporal entre 1 y 9');
}
