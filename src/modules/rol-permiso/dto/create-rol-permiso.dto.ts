import { ApiProperty } from '@nestjs/swagger';

import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateRolPermisoDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'rol_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  rol_id!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'permiso_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  permiso_id!: string;
}
