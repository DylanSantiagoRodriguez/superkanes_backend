import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateMedicamentoDto {
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'nombre_comercial',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  nombre_comercial!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'principio_activo',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  principio_activo!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'concentracion',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  concentracion!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'forma_farmaceutica',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  forma_farmaceutica!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'presentacion',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  presentacion!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'laboratorio_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  laboratorio_id?: string | null;

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
