import { PartialType } from '@nestjs/swagger';
import { CreateFirmaConsentimientoDto } from './create-firma-consentimiento.dto';

export class UpdateFirmaConsentimientoDto extends PartialType(
  CreateFirmaConsentimientoDto,
  { skipNullProperties: false },
) {}
