import { PartialType } from '@nestjs/swagger';
import { CreatePlantillaConsentimientoDto } from './create-plantilla-consentimiento.dto';

export class UpdatePlantillaConsentimientoDto extends PartialType(
  CreatePlantillaConsentimientoDto,
  { skipNullProperties: false },
) {}
