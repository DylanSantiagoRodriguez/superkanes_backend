import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMascotaDto } from './create-mascota.dto';

export class UpdateMascotaDto extends PartialType(
  OmitType(CreateMascotaDto, ['tutor_principal_id'] as const),
  { skipNullProperties: false },
) {}
