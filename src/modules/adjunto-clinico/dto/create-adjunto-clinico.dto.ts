import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateAdjuntoClinicoDto {
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
    name: 'archivo_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  archivo_id!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'descripcion',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  descripcion?: string | null;
}
