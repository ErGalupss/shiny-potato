import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RoleScopeDto {
  @IsString()
  roleId!: string;

  @IsBoolean()
  isEnabled!: boolean;
}

export class CreateFeatureFlagDto {
  @IsString()
  key!: string;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RoleScopeDto)
  roles?: RoleScopeDto[];
}
