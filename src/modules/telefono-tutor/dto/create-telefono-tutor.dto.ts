import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateTelefonoTutorDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'tutor_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  tutor_id!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'numero',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  numero!: string;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['movil', 'fijo', 'otro'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'tipo',
    type: 'text',
    nullable: false,
    default: "'movil'",
    enum: ['movil', 'fijo', 'otro'],
  })
  tipo?: 'movil' | 'fijo' | 'otro';

  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'principal',
    type: 'boolean',
    nullable: false,
    default: 'false',
    enum: [],
  })
  principal?: boolean;

  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'permite_mensajeria',
    type: 'boolean',
    nullable: false,
    default: 'false',
    enum: [],
  })
  permite_mensajeria?: boolean;
}
