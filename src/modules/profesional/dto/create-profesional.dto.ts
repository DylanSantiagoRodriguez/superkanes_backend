import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateProfesionalDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'membresia_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  membresia_id!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'nombre_profesional',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  nombre_profesional!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'registro_profesional',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  registro_profesional?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'especialidad',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  especialidad?: string | null;
}
