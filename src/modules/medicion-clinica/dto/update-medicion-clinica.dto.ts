import { PartialType } from '@nestjs/swagger';
import { CreateMedicionClinicaDto } from './create-medicion-clinica.dto';

export class UpdateMedicionClinicaDto extends PartialType(
  CreateMedicionClinicaDto,
  { skipNullProperties: false },
) {}
