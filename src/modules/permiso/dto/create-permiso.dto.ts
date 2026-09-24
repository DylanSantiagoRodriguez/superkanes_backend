import { ApiProperty } from '@nestjs/swagger';

import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreatePermisoDto {
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'codigo',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  codigo!: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'descripcion',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  descripcion!: string;
}
