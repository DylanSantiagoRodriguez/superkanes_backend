import { PartialType } from '@nestjs/swagger';
import { CreatePrescripcionItemDto } from './create-prescripcion-item.dto';

export class UpdatePrescripcionItemDto extends PartialType(
  CreatePrescripcionItemDto,
  { skipNullProperties: false },
) {}
