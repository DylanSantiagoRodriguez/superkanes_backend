import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateLaboratorioDto {
  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'nombre',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  nombre!: string;

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'contacto',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  contacto?: string | null;

  @ApiProperty({ required: false, nullable: false, type: 'boolean' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'activo',
    type: 'boolean',
    nullable: false,
    default: 'true',
    enum: [],
  })
  activo?: boolean;
}
