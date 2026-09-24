import { ApiProperty } from '@nestjs/swagger';
export class UsuarioResponseDto {
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  id!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  proveedor_identidad!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  identificador_externo!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  nombre!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  email!: string;
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
