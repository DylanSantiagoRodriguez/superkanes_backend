import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsISO8601,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';

export class TransferGuardianDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  tutor_id!: string;

  @ApiProperty({ format: 'date' })
  @IsISO8601({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  vigente_desde!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  autorizado_consentir?: boolean;
}
