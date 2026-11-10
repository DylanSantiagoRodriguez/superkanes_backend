import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateRevisionClinicaDto {
  @ApiProperty({
    required: false,
    nullable: true,
    type: Object,
    additionalProperties: true,
    description:
      'Documento clínico Tiptap validado: hasta 200.000 caracteres y 1 MiB JSON',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'documento',
    type: 'jsonb',
    nullable: true,
    default: null,
    enum: [],
  })
  documento?: Record<string, unknown> | null;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'atencion_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  atencion_id!: string;

  @ApiProperty({ required: true, nullable: false, type: 'number' })
  @DatabaseValue({
    name: 'numero',
    type: 'integer',
    nullable: false,
    default: null,
    enum: [],
  })
  numero!: number;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'revision_previa_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  revision_previa_id?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'motivo_cambio',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  motivo_cambio?: string | null;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'motivo_consulta',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  motivo_consulta!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'anamnesis',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  anamnesis?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'examen_fisico',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  examen_fisico?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'evaluacion',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  evaluacion?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'plan',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  plan?: string | null;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['borrador', 'cerrada'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'estado',
    type: 'text',
    nullable: false,
    default: "'borrador'",
    enum: ['borrador', 'cerrada'],
  })
  estado?: 'borrador' | 'cerrada';
}
