import { ApiProperty } from '@nestjs/swagger';
export class ServicioPeluqueriaResponseDto {
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
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  sede_id!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  cita_id!: string | null;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'date',
  })
  fecha_servicio!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  llegada_en!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  inicio_en!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  finalizado_en!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  entregado_en!: string | null;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  responsable_id!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  tutor_contacto_id!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  telefono_contacto_servicio!: string;
  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  requiere_consentimiento!: boolean;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  observaciones_ingreso!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  incidentes!: string | null;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: [
      'programado',
      'recibido',
      'en_servicio',
      'finalizado',
      'entregado',
      'cancelado',
    ],
  })
  estado!:
    | 'programado'
    | 'recibido'
    | 'en_servicio'
    | 'finalizado'
    | 'entregado'
    | 'cancelado';
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
