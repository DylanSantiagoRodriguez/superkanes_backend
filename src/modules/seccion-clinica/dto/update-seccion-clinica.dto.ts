import { PartialType } from '@nestjs/swagger';
import { CreateSeccionClinicaDto } from './create-seccion-clinica.dto';

export class UpdateSeccionClinicaDto extends PartialType(
  CreateSeccionClinicaDto,
  { skipNullProperties: false },
) {}
