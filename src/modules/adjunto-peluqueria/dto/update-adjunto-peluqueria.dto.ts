import { PartialType } from '@nestjs/swagger';
import { CreateAdjuntoPeluqueriaDto } from './create-adjunto-peluqueria.dto';

export class UpdateAdjuntoPeluqueriaDto extends PartialType(
  CreateAdjuntoPeluqueriaDto,
  { skipNullProperties: false },
) {}
