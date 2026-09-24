import { ApiProperty } from '@nestjs/swagger';
export class SeccionClinicaResponseDto {
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  id!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  organizacion_id!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  revision_id!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  tipo_seccion_id!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  plantilla_id!: string;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['no_evaluado', 'sin_hallazgos', 'con_hallazgos'],
  })
  estado_evaluacion!: 'no_evaluado' | 'sin_hallazgos' | 'con_hallazgos';
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  hallazgos!: string | null;
  @ApiProperty({
    selfRequired: false,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  datos_estructurados!: Record<string, unknown> | unknown[];
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  creado_en!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  creado_por!: string | null;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  actualizado_en!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  actualizado_por!: string | null;
  @ApiProperty({ required: false, nullable: false, type: 'number' })
  version!: number;
}
