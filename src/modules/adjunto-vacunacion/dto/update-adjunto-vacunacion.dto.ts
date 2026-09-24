import { PartialType } from '@nestjs/swagger';
import { CreateAdjuntoVacunacionDto } from './create-adjunto-vacunacion.dto';

export class UpdateAdjuntoVacunacionDto extends PartialType(
  CreateAdjuntoVacunacionDto,
  { skipNullProperties: false },
) {}
