import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateServicioPeluqueriaDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'mascota_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  mascota_id!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'sede_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  sede_id!: string;

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
    required: true,
    nullable: false,
    type: 'string',
    format: 'date',
  })
  @DatabaseValue({
    name: 'fecha_servicio',
    type: 'date',
    nullable: false,
    default: null,
    enum: [],
  })
  fecha_servicio!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'llegada_en',
    type: 'timestamptz',
    nullable: true,
    default: null,
    enum: [],
  })
  llegada_en?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'inicio_en',
    type: 'timestamptz',
    nullable: true,
    default: null,
    enum: [],
  })
  inicio_en?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'finalizado_en',
    type: 'timestamptz',
    nullable: true,
    default: null,
    enum: [],
  })
  finalizado_en?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'entregado_en',
    type: 'timestamptz',
    nullable: true,
    default: null,
    enum: [],
  })
  entregado_en?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'responsable_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  responsable_id?: string | null;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'tutor_contacto_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  tutor_contacto_id!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'telefono_contacto_servicio',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  telefono_contacto_servicio?: string | null;

  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'requiere_consentimiento',
    type: 'boolean',
    nullable: false,
    default: 'true',
    enum: [],
  })
  requiere_consentimiento?: boolean;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'observaciones_ingreso',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  observaciones_ingreso?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'incidentes',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  incidentes?: string | null;

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
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'estado',
    type: 'text',
    nullable: false,
    default: "'programado'",
    enum: [
      'programado',
      'recibido',
      'en_servicio',
      'finalizado',
      'entregado',
      'cancelado',
    ],
  })
  estado?:
    | 'programado'
    | 'recibido'
    | 'en_servicio'
    | 'finalizado'
    | 'entregado'
    | 'cancelado';
}
