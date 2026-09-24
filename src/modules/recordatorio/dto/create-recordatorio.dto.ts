import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateRecordatorioDto {
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
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'cita_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  cita_id?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'pendiente_vacunal_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  pendiente_vacunal_id?: string | null;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['email', 'sms', 'whatsapp', 'push'],
  })
  @DatabaseValue({
    name: 'canal',
    type: 'text',
    nullable: false,
    default: null,
    enum: ['email', 'sms', 'whatsapp', 'push'],
  })
  canal!: 'email' | 'sms' | 'whatsapp' | 'push';

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  @DatabaseValue({
    name: 'programado_en',
    type: 'timestamptz',
    nullable: false,
    default: null,
    enum: [],
  })
  programado_en!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'enviado_en',
    type: 'timestamptz',
    nullable: true,
    default: null,
    enum: [],
  })
  enviado_en?: string | null;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['pendiente', 'procesando', 'enviado', 'fallido', 'cancelado'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'estado',
    type: 'text',
    nullable: false,
    default: "'pendiente'",
    enum: ['pendiente', 'procesando', 'enviado', 'fallido', 'cancelado'],
  })
  estado?: 'pendiente' | 'procesando' | 'enviado' | 'fallido' | 'cancelado';

  @ApiProperty({ required: false, nullable: false, type: 'number' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'intentos',
    type: 'integer',
    nullable: false,
    default: '0',
    enum: [],
  })
  intentos?: number;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'clave_idempotencia',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  clave_idempotencia!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'referencia_proveedor',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  referencia_proveedor?: string | null;
}
