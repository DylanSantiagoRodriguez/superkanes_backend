import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateOrganizacionDto {
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
    name: 'identificacion_fiscal',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  identificacion_fiscal?: string | null;

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    enum: ['activa', 'suspendida', 'inactiva'],
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'estado',
    type: 'text',
    nullable: false,
    default: "'activa'",
    enum: ['activa', 'suspendida', 'inactiva'],
  })
  estado?: 'activa' | 'suspendida' | 'inactiva';

  @ApiProperty({ required: false, nullable: false, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'zona_horaria_default',
    type: 'text',
    nullable: false,
    default: "'America/Bogota'",
    enum: [],
  })
  zona_horaria_default?: string;
}
