import { PartialType } from '@nestjs/swagger';
import { CreatePeluqueriaItemDto } from './create-peluqueria-item.dto';

export class UpdatePeluqueriaItemDto extends PartialType(
  CreatePeluqueriaItemDto,
  { skipNullProperties: false },
) {}
