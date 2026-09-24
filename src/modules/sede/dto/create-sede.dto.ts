import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateSedeDto {
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'nombre',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  nombre!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'codigo',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  codigo!: string;

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
    name: 'telefono',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  telefono?: string | null;

  @ApiProperty({ required: false, nullable: false, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'zona_horaria',
    type: 'text',
    nullable: false,
    default: "'America/Bogota'",
    enum: [],
  })
  zona_horaria?: string;

  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'activa',
    type: 'boolean',
    nullable: false,
    default: 'true',
    enum: [],
  })
  activa?: boolean;
}
