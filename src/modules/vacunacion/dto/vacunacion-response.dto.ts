import { ApiProperty } from '@nestjs/swagger';
export class VacunacionResponseDto {
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
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  sede_id!: string | null;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  vacuna_id!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  aplicada_en!: string;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['interna', 'externa'],
  })
  origen!: 'interna' | 'externa';
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  peso_kg!: string | number | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  aplicada_por!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  vacunador_externo!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  procedencia_externa!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  lote!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date',
  })
  vencimiento_lote!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  dosis!: string | number | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  unidad_dosis!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  via!: string | null;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  descripcion_vacuna_emitida!: string;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  observaciones!: string | null;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['aplicada', 'anulada'],
  })
  estado!: 'aplicada' | 'anulada';
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  motivo_anulacion!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  reemplaza_id!: string | null;
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
