import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateConsentimientoDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'servicio_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  servicio_id!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'plantilla_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  plantilla_id!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'documento_archivo_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  documento_archivo_id!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'hash_documento',
    type: 'char(64)',
    nullable: false,
    default: null,
    enum: [],
  })
  hash_documento!: string;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['pendiente', 'aceptado', 'rechazado', 'revocado'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'estado',
    type: 'text',
    nullable: false,
    default: "'pendiente'",
    enum: ['pendiente', 'aceptado', 'rechazado', 'revocado'],
  })
  estado?: 'pendiente' | 'aceptado' | 'rechazado' | 'revocado';

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'emitido_en',
    type: 'timestamptz',
    nullable: false,
    default: 'now()',
    enum: [],
  })
  emitido_en?: string;
}
