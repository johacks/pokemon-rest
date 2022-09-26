import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { FilterParams, PokemonsService } from '../services/pokemons.service';
import { Pokemon, PokemonType, PokemonTypes } from '../schemas/pokemons.schema';
import { IsString, Matches } from 'class-validator';

// We allow an id and name identification, e.g. id::001 or name::bulbasaur
export const NAME_HEADER = 'name::';
export const ID_HEADER = 'id::';
export const POKEMON_ID_REGEX = new RegExp(`${NAME_HEADER}|${ID_HEADER}[0-9]+`);

export class PokemonPublicId {
  @Matches(POKEMON_ID_REGEX)
  @IsString()
  id: string;
}

@Controller('pokemons')
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get('/')
  async findAll(
    @Query(new ValidationPipe({ transform: true })) filterParams: FilterParams,
  ): Promise<Pokemon[]> {
    return this.pokemonsService.findAll(filterParams);
  }

  @Get('/types/')
  async getTypes(): Promise<PokemonType[]> {
    return PokemonTypes;
  }

  // Public id may be name::<name> or id::<number>
  @Get(':id')
  async findOne(@Param() id: PokemonPublicId): Promise<Pokemon> {
    const ret = await this.pokemonsService.findOne(id.id);
    if (!ret) throw new NotFoundException();
    return ret;
  }
}
