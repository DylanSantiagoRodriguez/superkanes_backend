import {
  IsIn,
  IsUUID,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class ClinicalQueryDto {
  @IsOptional() @IsUUID() site?: string;
  @IsOptional() @IsUUID() responsible?: string;
  @IsOptional() @IsString() @Matches(/^\d{1,3}$/) limit?: string;
  @IsOptional() @IsString() @MaxLength(400) after?: string;
  @IsOptional() @IsISO8601({ strict: true }) from?: string;
  @IsOptional() @IsISO8601({ strict: true }) to?: string;
  @IsOptional() @IsString() @MaxLength(100) search?: string;
  @IsOptional()
  @IsIn(['clinica', 'vacunacion', 'peluqueria', 'laboratorio'])
  type?: string;
}
