import { ApiProperty } from '@nestjs/swagger';
export class EventoAuditoriaResponseDto {
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
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  actor_usuario_id!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  actor_servicio!: string | null;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  accion!: string;
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  entidad!: string;
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  registro_id!: string;
  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  ocurrido_en!: string;
  @ApiProperty({
    selfRequired: false,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  campos_modificados!: Record<string, unknown> | unknown[];
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  motivo!: string | null;
  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  request_id!: string | null;
  @ApiProperty({ required: false, nullable: true, type: 'string' })
  ip!: string | null;
}
