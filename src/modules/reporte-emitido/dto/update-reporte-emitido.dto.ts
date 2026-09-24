import { PartialType } from '@nestjs/swagger';
import { CreateReporteEmitidoDto } from './create-reporte-emitido.dto';

export class UpdateReporteEmitidoDto extends PartialType(
  CreateReporteEmitidoDto,
  { skipNullProperties: false },
) {}
