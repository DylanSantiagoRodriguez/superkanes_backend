import { ApiProperty } from '@nestjs/swagger';
export class AlertaMascotaResponseDto {
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
    format: 'uuid',
  })
  mascota_id!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  tipo!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  descripcion!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['informativa', 'moderada', 'critica'],
  })
  severidad!: 'informativa' | 'moderada' | 'critica';
  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  activa!: boolean;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  detectada_en!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  resuelta_en!: string | null;
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
