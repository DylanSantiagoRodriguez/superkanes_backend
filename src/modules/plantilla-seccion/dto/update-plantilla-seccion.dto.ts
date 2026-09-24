import { PartialType } from '@nestjs/swagger';
import { CreatePlantillaSeccionDto } from './create-plantilla-seccion.dto';

export class UpdatePlantillaSeccionDto extends PartialType(
  CreatePlantillaSeccionDto,
  { skipNullProperties: false },
) {}
