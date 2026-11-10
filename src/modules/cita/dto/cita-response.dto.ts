import { ApiProperty } from '@nestjs/swagger';
export class CitaResponseDto {
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
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  tutor_contacto_id!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['clinica', 'vacunacion', 'peluqueria'],
  })
  tipo!: 'clinica' | 'vacunacion' | 'peluqueria';
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  inicio!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  fin!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  responsable_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  pendiente_vacunal_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: [
      'programada',
      'confirmada',
      'en_atencion',
      'completada',
      'cancelada',
      'no_asistio',
    ],
  })
  estado!:
    | 'programada'
    | 'confirmada'
    | 'en_atencion'
    | 'completada'
    | 'cancelada'
    | 'no_asistio';
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  notas!: string | null;
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
  @ApiProperty({ nullable: true, type: 'string', format: 'date-time' })
  llegada_en!: string | null;
}
