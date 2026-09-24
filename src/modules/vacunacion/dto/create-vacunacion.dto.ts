import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateVacunacionDto {
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
    name: 'sede_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  sede_id?: string | null;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'vacuna_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  vacuna_id!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  @DatabaseValue({
    name: 'aplicada_en',
    type: 'timestamptz',
    nullable: false,
    default: null,
    enum: [],
  })
  aplicada_en!: string;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['interna', 'externa'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'origen',
    type: 'text',
    nullable: false,
    default: "'interna'",
    enum: ['interna', 'externa'],
  })
  origen?: 'interna' | 'externa';

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'peso_kg',
    type: 'numeric(7,3)',
    nullable: true,
    default: null,
    enum: [],
  })
  peso_kg?: string | number | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'aplicada_por',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  aplicada_por?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'vacunador_externo',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  vacunador_externo?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'procedencia_externa',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  procedencia_externa?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'lote',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  lote?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'vencimiento_lote',
    type: 'date',
    nullable: true,
    default: null,
    enum: [],
  })
  vencimiento_lote?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'dosis',
    type: 'numeric(8,3)',
    nullable: true,
    default: null,
    enum: [],
  })
  dosis?: string | number | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'unidad_dosis',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  unidad_dosis?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'via',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  via?: string | null;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'descripcion_vacuna_emitida',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  descripcion_vacuna_emitida!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'observaciones',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  observaciones?: string | null;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['aplicada', 'anulada'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'estado',
    type: 'text',
    nullable: false,
    default: "'aplicada'",
    enum: ['aplicada', 'anulada'],
  })
  estado?: 'aplicada' | 'anulada';

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

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'reemplaza_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  reemplaza_id?: string | null;
}
