import {
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CalendarQueryDto {
  @IsISO8601({ strict: true }) @Matches(/^\d{4}-\d{2}-\d{2}$/) from!: string;
  @IsISO8601({ strict: true }) @Matches(/^\d{4}-\d{2}-\d{2}$/) to!: string;
  @IsString() @MaxLength(100) timeZone!: string;
  @IsOptional() @IsString() @Matches(/^\d{1,3}$/) limit?: string;
  @IsOptional() @IsString() @MaxLength(400) after?: string;
}
