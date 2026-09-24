import { ApiProperty } from '@nestjs/swagger';
export class ArchivoResponseDto {
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  id!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  organizacion_id!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['minio', 'local'],
  })
  proveedor!: 'minio' | 'local';
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  contenedor!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  ruta_relativa!: string;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  version_objeto!: string | null;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  nombre_original!: string;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  mime_detectado!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  tamano_bytes!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  sha256!: string | null;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  categoria!: string;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['pendiente', 'disponible', 'rechazado'],
  })
  estado_analisis!: 'pendiente' | 'disponible' | 'rechazado';
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  cargado_en!: string;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  creado_en!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  creado_por!: string | null;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  actualizado_en!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  actualizado_por!: string | null;
  @ApiProperty({ required: false, nullable: false, type: 'number' })
  version!: number;
}
