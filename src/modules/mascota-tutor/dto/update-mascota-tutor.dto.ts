import { PartialType } from '@nestjs/swagger';
import { CreateMascotaTutorDto } from './create-mascota-tutor.dto';

export class UpdateMascotaTutorDto extends PartialType(CreateMascotaTutorDto, {
  skipNullProperties: false,
}) {}
