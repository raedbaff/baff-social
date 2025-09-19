import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class PaginationDTO {
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'page number must be at least 1' })
  page: number;
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Take must be at least 1' })
  take: number;
}
