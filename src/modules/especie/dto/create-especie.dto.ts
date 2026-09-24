import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateEspecieDto {
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'nombre',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  nombre!: string;

  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'activa',
    type: 'boolean',
    nullable: false,
    default: 'true',
    enum: [],
  })
  activa?: boolean;
}
