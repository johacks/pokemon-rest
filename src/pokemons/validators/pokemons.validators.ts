import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { POKEMON_ID_REGEX } from '../services/pokemons.service';
import { PaginationParams } from '../../utils/pagination';
import { PokemonType, PokemonTypes } from '../schemas/pokemons.schema';
import { Transform, Type } from 'class-transformer';

export class PokemonPublicId {
  @Matches(POKEMON_ID_REGEX)
  @IsString()
  id: string;
}

// Filters for pokemon search
export class FilterParams extends PaginationParams {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsIn(PokemonTypes, { each: true })
  @Type(() => String)
  @Transform(({ value }) => value.split(','))
  types: PokemonType[];

  @IsOptional()
  @IsArray()
  @IsIn(PokemonTypes, { each: true })
  @Type(() => String)
  @Transform(({ value }) => value.split(','))
  resistant: PokemonType[];

  @IsOptional()
  @IsArray()
  @IsIn(PokemonTypes, { each: true })
  @Type(() => String)
  @Transform(({ value }) => value.split(','))
  weaknesses: PokemonType[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fleeRateLower?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fleeRateUpper?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxCPLower?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxCPUpper?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxHPLower?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxHPUpper?: number;
}
