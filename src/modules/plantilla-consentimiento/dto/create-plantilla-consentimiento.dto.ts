import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreatePlantillaConsentimientoDto {
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'nombre',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  nombre!: string;

  @ApiProperty({ required: true, nullable: false, type: 'number' })
  @DatabaseValue({
    name: 'numero_version',
    type: 'integer',
    nullable: false,
    default: null,
    enum: [],
  })
  numero_version!: number;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'contenido',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  contenido!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'publicada_en',
    type: 'timestamptz',
    nullable: true,
    default: null,
    enum: [],
  })
  publicada_en?: string | null;

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
