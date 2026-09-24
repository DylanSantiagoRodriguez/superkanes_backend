import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { DatabaseValue } from '../../../common/validation/database-value.decorator';

export class CreatePreferenciaComunicacionDto {
  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @DatabaseValue({
    name: 'tutor_id',
    type: 'uuid',
    nullable: false,
    default: null,
    enum: [],
  })
  tutor_id!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['email', 'sms', 'whatsapp', 'push', 'telefono'],
  })
  @DatabaseValue({
    name: 'canal',
    type: 'text',
    nullable: false,
    default: null,
    enum: ['email', 'sms', 'whatsapp', 'push', 'telefono'],
  })
  canal!: 'email' | 'sms' | 'whatsapp' | 'push' | 'telefono';

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'finalidad',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  finalidad!: string;

  @ApiProperty({
    required: true,
    nullable: false,
    type: 'string',
    enum: ['aceptada', 'revocada'],
  })
  @DatabaseValue({
    name: 'estado',
    type: 'text',
    nullable: false,
    default: null,
    enum: ['aceptada', 'revocada'],
  })
  estado!: 'aceptada' | 'revocada';

  @ApiProperty({
    required: false,
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'registrada_en',
    type: 'timestamptz',
    nullable: false,
    default: 'now()',
    enum: [],
  })
  registrada_en?: string;

  @ApiProperty({ required: true, nullable: false, type: 'string' })
  @DatabaseValue({
    name: 'fuente',
    type: 'text',
    nullable: false,
    default: null,
    enum: [],
  })
  fuente!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @DatabaseValue({
    name: 'evidencia_archivo_id',
    type: 'uuid',
    nullable: true,
    default: null,
    enum: [],
  })
  evidencia_archivo_id?: string | null;
}
