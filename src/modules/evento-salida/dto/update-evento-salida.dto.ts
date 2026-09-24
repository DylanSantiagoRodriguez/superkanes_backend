import { PartialType } from '@nestjs/swagger';
import { CreateEventoSalidaDto } from './create-evento-salida.dto';

export class UpdateEventoSalidaDto extends PartialType(CreateEventoSalidaDto, {
  skipNullProperties: false,
}) {}
