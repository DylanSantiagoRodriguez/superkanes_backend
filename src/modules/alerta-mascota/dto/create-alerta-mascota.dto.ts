import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateAlertaMascotaDto {
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

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'tipo',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  tipo!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'descripcion',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  descripcion!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['informativa', 'moderada', 'critica'],
  })
  @DatabaseValue({
    name: 'severidad',
    type: 'text',
    nullable: false,
    default: null,
    enum: ['informativa', 'moderada', 'critica'],
  })
  severidad!: 'informativa' | 'moderada' | 'critica';

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

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'detectada_en',
    type: 'timestamptz',
    nullable: false,
    default: 'now()',
    enum: [],
  })
  detectada_en?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'resuelta_en',
    type: 'timestamptz',
    nullable: true,
    default: null,
    enum: [],
  })
  resuelta_en?: string | null;
}
