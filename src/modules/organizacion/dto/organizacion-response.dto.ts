import { ApiProperty } from '@nestjs/swagger';
export class OrganizacionResponseDto {
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  id!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  nombre!: string;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  identificacion_fiscal!: string | null;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['activa', 'suspendida', 'inactiva'],
  })
  estado!: 'activa' | 'suspendida' | 'inactiva';
  @ApiProperty({ required: false, nullable: false, type: 'string' })
  zona_horaria_default!: string;
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
