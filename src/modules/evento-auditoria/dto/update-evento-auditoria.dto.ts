import { PartialType } from '@nestjs/swagger';
import { CreateEventoAuditoriaDto } from './create-evento-auditoria.dto';

export class UpdateEventoAuditoriaDto extends PartialType(
  CreateEventoAuditoriaDto,
  { skipNullProperties: false },
) {}
