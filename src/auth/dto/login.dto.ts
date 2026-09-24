import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty() @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  password!: string;
  @ApiPropertyOptional({ enum: ['web', 'native'], default: 'web' })
  @IsOptional()
  @IsIn(['web', 'native'])
  client?: 'web' | 'native';
}
