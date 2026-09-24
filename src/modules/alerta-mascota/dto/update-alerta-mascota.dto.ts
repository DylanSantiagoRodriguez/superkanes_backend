import { PartialType } from '@nestjs/swagger';
import { CreateAlertaMascotaDto } from './create-alerta-mascota.dto';

export class UpdateAlertaMascotaDto extends PartialType(
  CreateAlertaMascotaDto,
  { skipNullProperties: false },
) {}
