import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateTutorDto {
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'nombres',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  nombres!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'apellidos',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  apellidos!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'pais_documento',
    type: 'char(2)',
    nullable: true,
    default: null,
    enum: [],
  })
  pais_documento?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'tipo_documento',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  tipo_documento?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'numero_documento',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  numero_documento?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'email',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  email?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'direccion',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  direccion?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'ciudad',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  ciudad?: string | null;

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

  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'activo',
    type: 'boolean',
    nullable: false,
    default: 'true',
    enum: [],
  })
  activo?: boolean;
}
