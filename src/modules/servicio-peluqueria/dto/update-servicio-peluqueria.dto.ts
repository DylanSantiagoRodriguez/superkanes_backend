import { PartialType } from '@nestjs/swagger';
import { CreateServicioPeluqueriaDto } from './create-servicio-peluqueria.dto';

export class UpdateServicioPeluqueriaDto extends PartialType(
  CreateServicioPeluqueriaDto,
  { skipNullProperties: false },
) {}
