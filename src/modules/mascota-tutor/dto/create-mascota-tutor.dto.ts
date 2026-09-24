import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateMascotaTutorDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'mascota_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  mascota_id!: string;

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

  @ApiProperty({ required: false, nullable: false, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'relacion',
    type: 'text',
    nullable: false,
    default: "'tutor'",
    enum: [],
  })
  relacion?: string;

  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'es_principal',
    type: 'boolean',
    nullable: false,
    default: 'false',
    enum: [],
  })
  es_principal?: boolean;

  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'autorizado_consentir',
    type: 'boolean',
    nullable: false,
    default: 'false',
    enum: [],
  })
  autorizado_consentir?: boolean;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'vigente_desde',
    type: 'date',
    nullable: false,
    default: 'CURRENT_DATE',
    enum: [],
  })
  vigente_desde?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'vigente_hasta',
    type: 'date',
    nullable: true,
    default: null,
    enum: [],
  })
  vigente_hasta?: string | null;
}
