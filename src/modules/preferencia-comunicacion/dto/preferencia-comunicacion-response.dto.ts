import { ApiProperty } from '@nestjs/swagger';
export class PreferenciaComunicacionResponseDto {
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
    required: true,
    nullable: false,
    type: 'string',
    enum: ['email', 'sms', 'whatsapp', 'push', 'telefono'],
  })
  canal!: 'email' | 'sms' | 'whatsapp' | 'push' | 'telefono';
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  finalidad!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['aceptada', 'revocada'],
  })
  estado!: 'aceptada' | 'revocada';
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  registrada_en!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  fuente!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  evidencia_archivo_id!: string | null;
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
