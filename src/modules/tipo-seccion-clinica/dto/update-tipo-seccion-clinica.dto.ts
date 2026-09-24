import { PartialType } from '@nestjs/swagger';
import { CreateTipoSeccionClinicaDto } from './create-tipo-seccion-clinica.dto';

export class UpdateTipoSeccionClinicaDto extends PartialType(
  CreateTipoSeccionClinicaDto,
  { skipNullProperties: false },
) {}
