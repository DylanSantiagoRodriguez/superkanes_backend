import { ApiProperty } from '@nestjs/swagger';
export class ConsentimientoResponseDto {
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
  servicio_id!: string | null;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  plantilla_id!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  documento_archivo_id!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  hash_documento!: string;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['pendiente', 'aceptado', 'rechazado', 'revocado'],
  })
  estado!: 'pendiente' | 'aceptado' | 'rechazado' | 'revocado';
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  emitido_en!: string;
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
  @ApiProperty({ nullable: true, type: 'string' })
  atencion_id!: string | null;
  @ApiProperty({ nullable: true, type: 'string' })
  procedimiento!: string | null;
  @ApiProperty({ nullable: true, type: 'string' })
  alcance!: string | null;
}
