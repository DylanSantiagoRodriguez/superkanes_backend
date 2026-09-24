import { ApiProperty } from '@nestjs/swagger';
export class MascotaTutorResponseDto {
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
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  tutor_id!: string;
  @ApiProperty({ required: false, nullable: false, type: 'string' })
  relacion!: string;
  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  es_principal!: boolean;
  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  autorizado_consentir!: boolean;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date',
  })
  vigente_desde!: string;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date',
  })
  vigente_hasta!: string | null;
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
