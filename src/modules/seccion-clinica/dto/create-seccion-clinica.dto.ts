import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateSeccionClinicaDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'revision_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  revision_id!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'tipo_seccion_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  tipo_seccion_id!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'plantilla_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  plantilla_id!: string;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['no_evaluado', 'sin_hallazgos', 'con_hallazgos'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'estado_evaluacion',
    type: 'text',
    nullable: false,
    default: "'no_evaluado'",
    enum: ['no_evaluado', 'sin_hallazgos', 'con_hallazgos'],
  })
  estado_evaluacion?: 'no_evaluado' | 'sin_hallazgos' | 'con_hallazgos';

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'hallazgos',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  hallazgos?: string | null;

  @ApiProperty({
    selfRequired: false,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'datos_estructurados',
    type: 'jsonb',
    nullable: false,
    default: "'{}'::jsonb",
    enum: [],
  })
  datos_estructurados?: Record<string, unknown> | unknown[];
}
