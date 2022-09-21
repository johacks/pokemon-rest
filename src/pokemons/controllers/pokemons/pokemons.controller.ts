import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  FilterParams,
  PokemonsService,
} from '../../services/pokemons/pokemons.service';
import { Pokemon } from '../../schemas/pokemons/pokemons.schema';

@Controller('pokemons')
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get('/')
  async findAll(@Query() filterParams: FilterParams): Promise<Pokemon[]> {
    return this.pokemonsService.findAll(filterParams);
  }

  @Get(':id')
  async findOne(@Param('id') pokemonId: number): Promise<Pokemon> {
    return this.pokemonsService.findOne(pokemonId);
  }
}
