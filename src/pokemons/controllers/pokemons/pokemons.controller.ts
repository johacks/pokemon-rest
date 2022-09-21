import { Controller, Get, Param } from '@nestjs/common';
import { PokemonsService } from '../../services/pokemons/pokemons.service';
import { Pokemon } from '../../schemas/pokemons/pokemons.schema';

@Controller('pokemons')
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get('/')
  async findAll(): Promise<Pokemon[]> {
    return this.pokemonsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') pokemonId: number): Promise<Pokemon> {
    return this.pokemonsService.findOne(pokemonId);
  }
}
