import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ELink {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
