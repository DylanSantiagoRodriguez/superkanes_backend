import { PartialType } from '@nestjs/swagger';
import { CreatePrescripcionDto } from './create-prescripcion.dto';

export class UpdatePrescripcionDto extends PartialType(CreatePrescripcionDto, {
  skipNullProperties: false,
}) {}
