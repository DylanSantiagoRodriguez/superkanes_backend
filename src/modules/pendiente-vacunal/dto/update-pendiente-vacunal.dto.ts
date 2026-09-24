import { PartialType } from '@nestjs/swagger';
import { CreatePendienteVacunalDto } from './create-pendiente-vacunal.dto';

export class UpdatePendienteVacunalDto extends PartialType(
  CreatePendienteVacunalDto,
  { skipNullProperties: false },
) {}
