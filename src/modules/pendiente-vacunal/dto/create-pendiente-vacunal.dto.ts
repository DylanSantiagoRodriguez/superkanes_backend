import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreatePendienteVacunalDto {
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
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'vacunacion_origen_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  vacunacion_origen_id?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'vacuna_prevista_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  vacuna_prevista_id?: string | null;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'indicacion',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  indicacion!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'date',
  })
  @DatabaseValue({
    name: 'fecha_objetivo',
    type: 'date',
    nullable: false,
    default: null,
    enum: [],
  })
  fecha_objetivo!: string;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['pendiente', 'cumplido', 'cancelado'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'estado',
    type: 'text',
    nullable: false,
    default: "'pendiente'",
    enum: ['pendiente', 'cumplido', 'cancelado'],
  })
  estado?: 'pendiente' | 'cumplido' | 'cancelado';

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'vacunacion_cumplimiento_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  vacunacion_cumplimiento_id?: string | null;
}
