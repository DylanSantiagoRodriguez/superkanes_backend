import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreatePrescripcionDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'revision_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  revision_id!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'profesional_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  profesional_id!: string;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'emitida_en',
    type: 'timestamptz',
    nullable: false,
    default: 'now()',
    enum: [],
  })
  emitida_en?: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'indicaciones_generales',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  indicaciones_generales?: string | null;
}
