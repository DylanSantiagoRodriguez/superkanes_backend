import { PartialType } from '@nestjs/swagger';
import { CreateDiagnosticoAtencionDto } from './create-diagnostico-atencion.dto';

export class UpdateDiagnosticoAtencionDto extends PartialType(
  CreateDiagnosticoAtencionDto,
  { skipNullProperties: false },
) {}
