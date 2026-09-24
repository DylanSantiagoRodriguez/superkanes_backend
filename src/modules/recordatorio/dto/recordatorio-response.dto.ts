import { ApiProperty } from '@nestjs/swagger';
export class RecordatorioResponseDto {
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
  tutor_id!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  cita_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  pendiente_vacunal_id!: string | null;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['email', 'sms', 'whatsapp', 'push'],
  })
  canal!: 'email' | 'sms' | 'whatsapp' | 'push';
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  programado_en!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  enviado_en!: string | null;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['pendiente', 'procesando', 'enviado', 'fallido', 'cancelado'],
  })
  estado!: 'pendiente' | 'procesando' | 'enviado' | 'fallido' | 'cancelado';
  @ApiProperty({ required: false, nullable: false, type: 'number' })
  intentos!: number;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  clave_idempotencia!: string;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  referencia_proveedor!: string | null;
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
