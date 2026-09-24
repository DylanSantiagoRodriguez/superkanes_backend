import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateFirmaConsentimientoDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'consentimiento_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  consentimiento_id!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'tutor_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  tutor_id!: string;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'firmado_en',
    type: 'timestamptz',
    nullable: false,
    default: 'now()',
    enum: [],
  })
  firmado_en?: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['presencial_digital', 'documento_escaneado', 'firma_electronica'],
  })
  @DatabaseValue({
    name: 'metodo',
    type: 'text',
    nullable: false,
    default: null,
    enum: ['presencial_digital', 'documento_escaneado', 'firma_electronica'],
  })
  metodo!: 'presencial_digital' | 'documento_escaneado' | 'firma_electronica';

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'evidencia_archivo_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  evidencia_archivo_id!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'hash_documento_aceptado',
    type: 'char(64)',
    nullable: false,
    default: null,
    enum: [],
  })
  hash_documento_aceptado!: string;
}
