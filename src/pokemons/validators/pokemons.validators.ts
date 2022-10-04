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
import { PaginationParams } from 'src/utils/pagination';
import {
  PokemonType,
  PokemonTypes,
} from 'src/pokemons/schemas/pokemons.schema';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// We allow an id and name identification, e.g. id::001 or name::bulbasaur
export const NAME_HEADER = 'name::';
export const ID_HEADER = 'id::';
export const POKEMON_ID_REGEX = new RegExp(`${NAME_HEADER}|${ID_HEADER}[0-9]+`);

export class PokemonPublicId {
  @Matches(POKEMON_ID_REGEX)
  @IsString()
  id: string;
}

const arrayTransform = ({ value }) =>
  Array.isArray(value) ? value : value.toString().split(',');

// Filters for pokemon search
export class FilterParams extends PaginationParams {
  @ApiPropertyOptional({
    description:
      'Array of 1-2 Pokemon types. Filtered Pokemon must contain all types provided.',
    minItems: 1,
    maxItems: 2,
    enum: PokemonType,
    isArray: true,
    type: [PokemonType],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsIn(PokemonTypes, { each: true })
  @Type(() => String)
  @Transform(arrayTransform)
  types?: PokemonType[];

  @ApiPropertyOptional({
    description:
      'Array of Pokemon types. Filtered Pokemon are resistant to those specified.',
    enum: PokemonType,
    isArray: true,
    type: [PokemonType],
  })
  @IsOptional()
  @IsArray()
  @IsIn(PokemonTypes, { each: true })
  @Type(() => String)
  @Transform(arrayTransform)
  resistant?: PokemonType[];

  @ApiPropertyOptional({
    description:
      'Array of Pokemon types. Filtered Pokemon are weak to those specified.',
    enum: PokemonType,
    isArray: true,
    type: [PokemonType],
  })
  @IsOptional()
  @IsArray()
  @IsIn(PokemonTypes, { each: true })
  @Type(() => String)
  @Transform(arrayTransform)
  weaknesses?: PokemonType[];

  @ApiPropertyOptional({ description: 'Lower bound for Pokemon flee rate.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fleeRateLower?: number;

  @ApiPropertyOptional({ description: 'Upper bound for Pokemon flee rate.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fleeRateUpper?: number;

  @ApiPropertyOptional({ description: 'Lower bound for Pokemon max CP.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxCPLower?: number;

  @ApiPropertyOptional({ description: 'Upper bound for Pokemon max CP.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxCPUpper?: number;

  @ApiPropertyOptional({ description: 'Lower bound for Pokemon max HP.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxHPLower?: number;

  @ApiPropertyOptional({ description: 'Upper bound for Pokemon max CP.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxHPUpper?: number;
}
