import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateEventoSalidaDto {
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'tipo',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  tipo!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'entidad_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  entidad_id!: string;

  @ApiProperty({
    selfRequired: true,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  @DatabaseValue({
    name: 'payload',
    type: 'jsonb',
    nullable: false,
    default: null,
    enum: [],
  })
  payload!: Record<string, unknown> | unknown[];

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'procesado_en',
    type: 'timestamptz',
    nullable: true,
    default: null,
    enum: [],
  })
  procesado_en?: string | null;

  @ApiProperty({ required: false, nullable: false, type: 'number' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'intentos',
    type: 'integer',
    nullable: false,
    default: '0',
    enum: [],
  })
  intentos?: number;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'clave_idempotencia',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  clave_idempotencia!: string;
}
