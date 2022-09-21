import { Controller, Get, Param, Query } from '@nestjs/common';
import { PokemonsService } from '../../services/pokemons/pokemons.service';
import { Pokemon } from '../../schemas/pokemons/pokemons.schema';
import { PaginationParams } from '../../../utils/pagination';

@Controller('pokemons')
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get('/')
  async findAll(
    @Query() { skip, limit }: PaginationParams,
  ): Promise<Pokemon[]> {
    return this.pokemonsService.findAll(skip, limit);
  }

  @Get(':id')
  async findOne(@Param('id') pokemonId: number): Promise<Pokemon> {
    return this.pokemonsService.findOne(pokemonId);
  }
}
