import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreatePrescripcionItemDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'prescripcion_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  prescripcion_id!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'medicamento_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  medicamento_id!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'descripcion_emitida',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  descripcion_emitida!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'dosis',
    type: 'numeric(12,4)',
    nullable: true,
    default: null,
    enum: [],
  })
  dosis?: string | number | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'unidad_dosis',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  unidad_dosis?: string | null;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'via',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  via!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'frecuencia',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  frecuencia!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'duracion',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  duracion!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'cantidad',
    type: 'numeric(12,3)',
    nullable: true,
    default: null,
    enum: [],
  })
  cantidad?: string | number | null;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'instrucciones',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  instrucciones!: string;
}
