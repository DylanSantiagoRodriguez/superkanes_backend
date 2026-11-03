import { IntersectionType, PickType } from '@nestjs/swagger';
import { CreateAtencionClinicaDto } from './create-atencion-clinica.dto';
import { CreateRevisionClinicaDto } from '../../revision-clinica/dto/create-revision-clinica.dto';
export class CreateAtencionHistoriaDto extends IntersectionType(
  CreateAtencionClinicaDto,
  PickType(CreateRevisionClinicaDto, ['motivo_consulta', 'documento'] as const),
) {}
