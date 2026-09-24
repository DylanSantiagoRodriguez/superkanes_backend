import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateReporteEmitidoDto {
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

  @ApiProperty({
    selfRequired: false,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'parametros',
    type: 'jsonb',
    nullable: false,
    default: "'{}'::jsonb",
    enum: [],
  })
  parametros?: Record<string, unknown> | unknown[];

  @ApiProperty({
    selfRequired: true,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  @DatabaseValue({
    name: 'datos_identificacion_snapshot',
    type: 'jsonb',
    nullable: false,
    default: null,
    enum: [],
  })
  datos_identificacion_snapshot!: Record<string, unknown> | unknown[];

  @ApiProperty({
    selfRequired: true,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  @DatabaseValue({
    name: 'fuentes_versionadas',
    type: 'jsonb',
    nullable: false,
    default: null,
    enum: [],
  })
  fuentes_versionadas!: Record<string, unknown> | unknown[];

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'version_plantilla',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  version_plantilla!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'archivo_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  archivo_id!: string;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'emitido_en',
    type: 'timestamptz',
    nullable: false,
    default: 'now()',
    enum: [],
  })
  emitido_en?: string;
}
