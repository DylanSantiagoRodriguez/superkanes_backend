import { PartialType } from '@nestjs/swagger';
import { CreateAtencionClinicaDto } from './create-atencion-clinica.dto';

export class UpdateAtencionClinicaDto extends PartialType(
  CreateAtencionClinicaDto,
  { skipNullProperties: false },
) {}
