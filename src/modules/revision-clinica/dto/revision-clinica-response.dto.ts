import { ApiProperty } from '@nestjs/swagger';
export class RevisionClinicaResponseDto {
  @ApiProperty({ nullable: true, type: 'object', additionalProperties: true })
  documento!: Record<string, unknown> | null;

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
  atencion_id!: string;
  @ApiProperty({ required: true, nullable: false, type: 'number' })
  numero!: number;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  revision_previa_id!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  motivo_cambio!: string | null;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  motivo_consulta!: string;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  anamnesis!: string | null;

  @ApiProperty({ nullable: true, type: 'string' })
  examen_fisico!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  evaluacion!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  plan!: string | null;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['borrador', 'cerrada'],
  })
  estado!: 'borrador' | 'cerrada';
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  cerrada_en!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  cerrada_por!: string | null;
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
