import { PartialType } from '@nestjs/swagger';
import { CreateRevisionClinicaDto } from './create-revision-clinica.dto';

export class UpdateRevisionClinicaDto extends PartialType(
  CreateRevisionClinicaDto,
  { skipNullProperties: false },
) {}
