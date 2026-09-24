import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateAsignacionRolDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'membresia_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  membresia_id!: string;

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
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'sede_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  sede_id?: string | null;
}
