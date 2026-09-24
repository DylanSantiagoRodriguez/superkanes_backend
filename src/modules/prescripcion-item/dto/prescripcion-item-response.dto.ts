import { ApiProperty } from '@nestjs/swagger';
export class PrescripcionItemResponseDto {
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
  prescripcion_id!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  medicamento_id!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  descripcion_emitida!: string;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  dosis!: string | number | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  unidad_dosis!: string | null;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  via!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  frecuencia!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  duracion!: string;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  cantidad!: string | number | null;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  instrucciones!: string;
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
