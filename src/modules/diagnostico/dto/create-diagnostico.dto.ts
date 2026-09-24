import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateDiagnosticoDto {
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'codigo',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  codigo?: string | null;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'nombre',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  nombre!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'sistema_codificacion',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  sistema_codificacion?: string | null;

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
