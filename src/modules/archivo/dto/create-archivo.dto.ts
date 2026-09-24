import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateArchivoDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['minio', 'local'],
  })
  @DatabaseValue({
    name: 'proveedor',
    type: 'text',
    nullable: false,
    default: null,
    enum: ['minio', 'local'],
  })
  proveedor!: 'minio' | 'local';

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'contenedor',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  contenedor!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'ruta_relativa',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  ruta_relativa!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'version_objeto',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  version_objeto?: string | null;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'nombre_original',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  nombre_original!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'mime_detectado',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  mime_detectado?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'tamano_bytes',
    type: 'bigint',
    nullable: true,
    default: null,
    enum: [],
  })
  tamano_bytes?: string | null;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'sha256',
    type: 'char(64)',
    nullable: true,
    default: null,
    enum: [],
  })
  sha256?: string | null;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'categoria',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  categoria!: string;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['pendiente', 'disponible', 'rechazado'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'estado_analisis',
    type: 'text',
    nullable: false,
    default: "'pendiente'",
    enum: ['pendiente', 'disponible', 'rechazado'],
  })
  estado_analisis?: 'pendiente' | 'disponible' | 'rechazado';

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'cargado_en',
    type: 'timestamptz',
    nullable: false,
    default: 'now()',
    enum: [],
  })
  cargado_en?: string;
}
