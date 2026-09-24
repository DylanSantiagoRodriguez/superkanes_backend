import { ApiProperty } from '@nestjs/swagger';
export class TelefonoTutorResponseDto {
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
  tutor_id!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  numero!: string;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['movil', 'fijo', 'otro'],
  })
  tipo!: 'movil' | 'fijo' | 'otro';
  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  principal!: boolean;
  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  permite_mensajeria!: boolean;
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
