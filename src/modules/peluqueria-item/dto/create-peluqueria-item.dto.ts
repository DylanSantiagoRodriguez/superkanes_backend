import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreatePeluqueriaItemDto {
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
    name: 'tipo_servicio_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  tipo_servicio_id!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'instrucciones',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  instrucciones?: string | null;
}
