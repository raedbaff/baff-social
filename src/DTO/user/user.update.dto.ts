import { IsArray, IsOptional, isString, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
export class EUpdateUser {
  @IsString()
  @IsOptional()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @IsOptional()
  @MinLength(4)
  bio: string;

  @IsString()
  @IsOptional()
  photo: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  links: string[];
}
