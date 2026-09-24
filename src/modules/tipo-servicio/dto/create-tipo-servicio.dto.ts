import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateTipoServicioDto {
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
    name: 'descripcion',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  descripcion?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'number' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'duracion_estimada_min',
    type: 'integer',
    nullable: true,
    default: null,
    enum: [],
  })
  duracion_estimada_min?: number | null;

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
