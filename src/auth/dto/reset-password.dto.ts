import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class ResetPasswordDto {
  @ApiProperty() @IsString() @Matches(/^[A-Za-z0-9_-]{64}$/) token!: string;
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
export class IssueResetDto {
  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  currentPassword!: string;
}
