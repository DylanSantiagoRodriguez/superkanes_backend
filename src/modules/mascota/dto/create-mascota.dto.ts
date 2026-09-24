import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateMascotaDto {
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'codigo',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  codigo!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'nombre',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  nombre!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'especie_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  especie_id!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'raza_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  raza_id?: string | null;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['macho', 'hembra', 'desconocido'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'sexo',
    type: 'text',
    nullable: false,
    default: "'desconocido'",
    enum: ['macho', 'hembra', 'desconocido'],
  })
  sexo?: 'macho' | 'hembra' | 'desconocido';

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'fecha_nacimiento',
    type: 'date',
    nullable: true,
    default: null,
    enum: [],
  })
  fecha_nacimiento?: string | null;

  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'nacimiento_estimado',
    type: 'boolean',
    nullable: false,
    default: 'false',
    enum: [],
  })
  nacimiento_estimado?: boolean;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'color',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  color?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'microchip',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  microchip?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'boolean' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'esterilizada',
    type: 'boolean',
    nullable: true,
    default: null,
    enum: [],
  })
  esterilizada?: boolean | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'foto_archivo_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  foto_archivo_id?: string | null;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['activa', 'inactiva', 'fallecida'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'estado',
    type: 'text',
    nullable: false,
    default: "'activa'",
    enum: ['activa', 'inactiva', 'fallecida'],
  })
  estado?: 'activa' | 'inactiva' | 'fallecida';

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'fecha_fallecimiento',
    type: 'date',
    nullable: true,
    default: null,
    enum: [],
  })
  fecha_fallecimiento?: string | null;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'tutor_principal_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  tutor_principal_id!: string;
}
