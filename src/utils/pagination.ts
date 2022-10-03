import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Extracted from
// https://wanago.io/2021/09/13/api-nestjs-pagination-mongodb-mongoose/
export class PaginationParams {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number;
}

export type PaginatedItem<T> = { count: number; docs: T[] };
