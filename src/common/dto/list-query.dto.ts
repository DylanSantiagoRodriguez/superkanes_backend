import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class ListQueryDto {
  @ApiPropertyOptional({ default: '25', description: 'Entre 1 y 100' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,3}$/)
  limit?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  after?: string;

  @ApiPropertyOptional({
    description: 'Objeto JSON de igualdad; hasta 10 campos',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  filter?: string;
}
