import { IsArray, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Link } from 'generated/prisma';
import { ELink } from './link.dto';
import { Type } from 'class-transformer';

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
  @ValidateNested({ each: true })
  @Type(() => ELink)
  links: ELink[];
}
