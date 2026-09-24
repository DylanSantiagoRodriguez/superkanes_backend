import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class TokenResponseDto {
  @ApiProperty() accessToken!: string;
  @ApiProperty({ example: 'Bearer' }) tokenType!: string;
  @ApiProperty({ example: 900 }) expiresIn!: number;
  @ApiPropertyOptional({
    description: 'Solo cliente native. Web recibe cookie HttpOnly.',
  })
  refreshToken?: string;
  @ApiProperty({ format: 'date-time' }) refreshExpiresAt!: string;
  @ApiProperty({ format: 'uuid' }) userId!: string;
}
