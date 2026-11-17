import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateCitaDto {
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

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['clinica', 'vacunacion', 'peluqueria'],
  })
  @DatabaseValue({
    name: 'tipo',
    type: 'text',
    nullable: false,
    default: null,
    enum: ['clinica', 'vacunacion', 'peluqueria'],
  })
  tipo!: 'clinica' | 'vacunacion' | 'peluqueria';

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  @DatabaseValue({
    name: 'inicio',
    type: 'timestamptz',
    nullable: false,
    default: null,
    enum: [],
  })
  inicio!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'fin',
    type: 'timestamptz',
    nullable: true,
    default: null,
    enum: [],
  })
  fin?: string | null;

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
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'estado',
    type: 'text',
    nullable: false,
    default: "'programada'",
    enum: [
      'programada',
      'confirmada',
      'en_atencion',
      'completada',
      'cancelada',
      'no_asistio',
    ],
  })
  estado?:
    | 'programada'
    | 'confirmada'
    | 'en_atencion'
    | 'completada'
    | 'cancelada'
    | 'no_asistio';

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'notas',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  notas?: string | null;
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
}
