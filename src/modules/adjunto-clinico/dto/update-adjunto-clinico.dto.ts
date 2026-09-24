import { PartialType } from '@nestjs/swagger';
import { CreateAdjuntoClinicoDto } from './create-adjunto-clinico.dto';

export class UpdateAdjuntoClinicoDto extends PartialType(
  CreateAdjuntoClinicoDto,
  { skipNullProperties: false },
) {}
