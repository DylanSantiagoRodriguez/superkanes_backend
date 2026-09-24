import { ApiProperty } from '@nestjs/swagger';
export class MedicamentoResponseDto {
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
  nombre_comercial!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  principio_activo!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  concentracion!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  forma_farmaceutica!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  presentacion!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  laboratorio_id!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  foto_archivo_id!: string | null;
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
