import { ApiProperty } from '@nestjs/swagger';
export class PlantillaSeccionResponseDto {
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
  tipo_seccion_id!: string;
  @ApiProperty({ required: true, nullable: false, type: 'number' })
  numero_version!: number;
  @ApiProperty({
    selfRequired: true,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  esquema_validacion!: Record<string, unknown> | unknown[];
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  publicada_en!: string | null;
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
