import { ApiProperty } from '@nestjs/swagger';
export class ReporteEmitidoResponseDto {
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
  mascota_id!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  tipo!: string;
  @ApiProperty({
    selfRequired: false,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  parametros!: Record<string, unknown> | unknown[];
  @ApiProperty({
    selfRequired: true,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  datos_identificacion_snapshot!: Record<string, unknown> | unknown[];
  @ApiProperty({
    selfRequired: true,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  fuentes_versionadas!: Record<string, unknown> | unknown[];
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  version_plantilla!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  archivo_id!: string;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  emitido_en!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  emitido_por!: string;
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
}
