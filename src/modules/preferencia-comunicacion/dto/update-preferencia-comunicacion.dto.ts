import { PartialType } from '@nestjs/swagger';
import { CreatePreferenciaComunicacionDto } from './create-preferencia-comunicacion.dto';

export class UpdatePreferenciaComunicacionDto extends PartialType(
  CreatePreferenciaComunicacionDto,
  { skipNullProperties: false },
) {}
