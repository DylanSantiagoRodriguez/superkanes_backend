import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
export class RefreshDto {
  @ApiPropertyOptional({
    description: 'Solo clientes nativos; web usa cookie HttpOnly',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{64}$/)
  refreshToken?: string;
  @ApiPropertyOptional({ enum: ['web', 'native'], default: 'web' })
  @IsOptional()
  @IsIn(['web', 'native'])
  client?: 'web' | 'native';
}
