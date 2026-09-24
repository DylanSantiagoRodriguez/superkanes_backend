import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreateDiagnosticoAtencionDto {
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
    name: 'diagnostico_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  diagnostico_id!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['presuntivo', 'confirmado', 'descartado'],
  })
  @DatabaseValue({
    name: 'clasificacion',
    type: 'text',
    nullable: false,
    default: null,
    enum: ['presuntivo', 'confirmado', 'descartado'],
  })
  clasificacion!: 'presuntivo' | 'confirmado' | 'descartado';

  @ApiProperty({ required: false, nullable: true, type: 'string' })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'observaciones',
    type: 'text',
    nullable: true,
    default: null,
    enum: [],
  })
  observaciones?: string | null;
}
