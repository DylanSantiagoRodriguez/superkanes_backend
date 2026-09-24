import { PartialType } from '@nestjs/swagger';
import { CreateTelefonoTutorDto } from './create-telefono-tutor.dto';

export class UpdateTelefonoTutorDto extends PartialType(
  CreateTelefonoTutorDto,
  { skipNullProperties: false },
) {}
