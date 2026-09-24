import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreatePlantillaSeccionDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'tipo_seccion_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  tipo_seccion_id!: string;

  @ApiProperty({ required: true, nullable: false, type: 'number' })
  @DatabaseValue({
    name: 'numero_version',
    type: 'integer',
    nullable: false,
    default: null,
    enum: [],
  })
  numero_version!: number;

  @ApiProperty({
    selfRequired: true,
    nullable: false,
    type: 'object',
    additionalProperties: true,
  })
  @DatabaseValue({
    name: 'esquema_validacion',
    type: 'jsonb',
    nullable: false,
    default: null,
    enum: [],
  })
  esquema_validacion!: Record<string, unknown> | unknown[];

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'publicada_en',
    type: 'timestamptz',
    nullable: true,
    default: null,
    enum: [],
  })
  publicada_en?: string | null;
}
