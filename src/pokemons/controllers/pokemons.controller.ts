import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PokemonsService } from '../services/pokemons.service';
import {
  FilterParams,
  PokemonPublicId,
} from '../validators/pokemons.validators';
import { Pokemon, PokemonType, PokemonTypes } from '../schemas/pokemons.schema';

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
