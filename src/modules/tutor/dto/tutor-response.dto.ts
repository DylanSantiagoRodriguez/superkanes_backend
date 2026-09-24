import { ApiProperty } from '@nestjs/swagger';
export class TutorResponseDto {
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
  nombres!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  apellidos!: string;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  pais_documento!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  tipo_documento!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  numero_documento!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  email!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  direccion!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  ciudad!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  observaciones!: string | null;
  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  activo!: boolean;
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
