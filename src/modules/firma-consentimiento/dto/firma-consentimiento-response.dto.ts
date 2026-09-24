import { ApiProperty } from '@nestjs/swagger';
export class FirmaConsentimientoResponseDto {
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
  consentimiento_id!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  tutor_id!: string;
  @ApiProperty({
    selfRequired: true,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  identidad_firmante_snapshot!: Record<string, unknown> | unknown[];
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  firmado_en!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['presencial_digital', 'documento_escaneado', 'firma_electronica'],
  })
  metodo!: 'presencial_digital' | 'documento_escaneado' | 'firma_electronica';
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  evidencia_archivo_id!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  hash_documento_aceptado!: string;
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
