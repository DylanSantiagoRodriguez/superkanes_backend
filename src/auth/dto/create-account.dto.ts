import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
export class CreateAccountDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(200) nombre!: string;
  @ApiProperty() @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty({
    format: 'password',
    writeOnly: true,
    minLength: 15,
    maxLength: 128,
  })
  @IsString()
  @MinLength(15)
  @MaxLength(256)
  password!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() organizacion_id!: string;
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  rol_id?: string;
}
