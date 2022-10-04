import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Pokemon } from 'src/pokemons/schemas/pokemons.schema';

// For api documentation purposes
class PaginationSchema<T> implements PaginatedItem<T> {
  @ApiProperty({
    description: 'Total count of documents, provided to allow pagination',
    example: 1,
  })
  count: number;

  @ApiProperty()
  docs: T[];
}

export class PokemonPaginationSchema extends PaginationSchema<Pokemon> {
  @ApiProperty({
    type: Pokemon,
    description: 'Pokemons that match filters',
    isArray: true,
  })
  docs: Pokemon[];
}

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
