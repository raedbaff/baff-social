import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGroupchatDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  description: string;

  @IsNumber()
  ownerId: number;

  @IsString()
  photo: string;
}
