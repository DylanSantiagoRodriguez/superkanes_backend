import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
export class ChangePasswordDto {
  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  currentPassword!: string;
  @ApiProperty({
    format: 'password',
    writeOnly: true,
    minLength: 15,
    maxLength: 128,
  })
  @IsString()
  @MinLength(15)
  @MaxLength(256)
  newPassword!: string;
}
