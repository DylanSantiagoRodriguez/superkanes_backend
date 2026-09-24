import { ApiProperty } from '@nestjs/swagger';
export class EventoSalidaResponseDto {
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
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  tipo!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  entidad_id!: string;
  @ApiProperty({
    selfRequired: true,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  payload!: Record<string, unknown> | unknown[];
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  procesado_en!: string | null;
  @ApiProperty({ required: false, nullable: false, type: 'number' })
  intentos!: number;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  clave_idempotencia!: string;
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
