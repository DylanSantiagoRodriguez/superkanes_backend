import { ApiProperty } from '@nestjs/swagger';
export class MascotaResponseDto {
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
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  codigo!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  nombre!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  especie_id!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  raza_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['macho', 'hembra', 'desconocido'],
  })
  sexo!: 'macho' | 'hembra' | 'desconocido';
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date',
  })
  fecha_nacimiento!: string | null;
  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  nacimiento_estimado!: boolean;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  color!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  microchip!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'boolean' })
  esterilizada!: boolean | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  foto_archivo_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['activa', 'inactiva', 'fallecida'],
  })
  estado!: 'activa' | 'inactiva' | 'fallecida';
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date',
  })
  fecha_fallecimiento!: string | null;
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
