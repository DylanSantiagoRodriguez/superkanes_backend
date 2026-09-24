import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateEventoAuditoriaDto {
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'actor_usuario_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  actor_usuario_id?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'actor_servicio',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  actor_servicio?: string | null;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'accion',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  accion!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'entidad',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  entidad!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'registro_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  registro_id!: string;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'ocurrido_en',
    type: 'timestamptz',
    nullable: false,
    default: 'clock_timestamp()',
    enum: [],
  })
  ocurrido_en?: string;

  @ApiProperty({
    selfRequired: false,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'campos_modificados',
    type: 'jsonb',
    nullable: false,
    default: "'[]'::jsonb",
    enum: [],
  })
  campos_modificados?: Record<string, unknown> | unknown[];

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'motivo',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  motivo?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'request_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  request_id?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'ip',
    type: 'inet',
    nullable: true,
    default: null,
    enum: [],
  })
  ip?: string | null;
}
