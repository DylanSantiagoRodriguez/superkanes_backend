import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateAtencionClinicaDto {
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
    format: 'date-time',
  })
  @DatabaseValue({
    name: 'fecha_atencion',
    type: 'timestamptz',
    nullable: false,
    default: null,
    enum: [],
  })
  fecha_atencion!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'profesional_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  profesional_id!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'tutor_presente_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  tutor_presente_id?: string | null;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['abierta', 'cerrada', 'anulada'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'estado',
    type: 'text',
    nullable: false,
    default: "'abierta'",
    enum: ['abierta', 'cerrada', 'anulada'],
  })
  estado?: 'abierta' | 'cerrada' | 'anulada';

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'motivo_anulacion',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  motivo_anulacion?: string | null;
}
