import { ApiProperty } from '@nestjs/swagger';

import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateMedicionClinicaDto {
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

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'tipo',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  tipo!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'valor',
    type: 'numeric(10,3)',
    nullable: false,
    default: null,
    enum: [],
  })
  valor!: string | number;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'unidad',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  unidad!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  @DatabaseValue({
    name: 'medida_en',
    type: 'timestamptz',
    nullable: false,
    default: null,
    enum: [],
  })
  medida_en!: string;
}
