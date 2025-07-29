import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMessagingDto {
  @IsString()
  @MinLength(1, { message: 'Content must not be empty' })
  content: string;

  @IsString({ each: true })
  @IsOptional()
  files: string[];

  @IsNumber()
  @Type(() => Number)
  userId: number;
  @IsNumber()
  @Type(() => Number)
  receiverId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  groupChatId: number;
}
