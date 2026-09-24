import { PartialType } from '@nestjs/swagger';
import { CreateConsentimientoDto } from './create-consentimiento.dto';

export class UpdateConsentimientoDto extends PartialType(
  CreateConsentimientoDto,
  { skipNullProperties: false },
) {}
