import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class OrganizationAccessDto {
  @IsUUID() organizacion_id!: string;
  @IsOptional() @IsUUID() rol_id?: string;
  @IsOptional() @IsBoolean() crear_rol_administrador?: boolean;
}
export class LinkOrganizationsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => OrganizationAccessDto)
  organizaciones!: OrganizationAccessDto[];
}
export class CreateManagedUserDto extends LinkOrganizationsDto {
  @IsString() @MinLength(1) @MaxLength(200) nombre!: string;
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @MinLength(15) @MaxLength(256) password!: string;
}
export class UserSearchDto {
  @IsOptional() @IsString() @MaxLength(100) search?: string;
  @IsOptional() @IsUUID() after?: string;
}
export class OrganizationOptionsDto {
  @IsOptional() @IsUUID() usuario_id?: string;
  @IsOptional() @IsUUID() after?: string;
}
