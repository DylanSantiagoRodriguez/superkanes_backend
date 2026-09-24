import { PartialType } from '@nestjs/swagger';
import { CreateAsignacionRolDto } from './create-asignacion-rol.dto';

export class UpdateAsignacionRolDto extends PartialType(
  CreateAsignacionRolDto,
  { skipNullProperties: false },
) {}
