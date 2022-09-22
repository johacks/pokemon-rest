import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  FilterParams,
  PokemonsService,
} from '../../services/pokemons/pokemons.service';
import { Pokemon } from '../../schemas/pokemons/pokemonSchema';
import { IsString, Matches } from 'class-validator';

// We allow an id and name identification, e.g. id::001 or name::bulbasaur
const NAME_HEADER = 'name::';
const ID_HEADER = 'id::';
const POKEMON_ID_PATTERN = `${NAME_HEADER}|${ID_HEADER}[0-9]+`;
export class PokemonPublicId {
  @Matches(new RegExp(POKEMON_ID_PATTERN))
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

  // Public id may be name::<name> or id::<number>
  @Get(':id')
  async findOne(@Param() id: PokemonPublicId): Promise<Pokemon> {
    const pid = id.id;
    let ret = undefined;
    if (pid.startsWith(NAME_HEADER)) {
      ret = await this.pokemonsService.findOneByName(
        pid.substring(NAME_HEADER.length),
      );
    } else {
      ret = await this.pokemonsService.findOneById(
        pid.substring(ID_HEADER.length),
      );
    }
    if (ret === undefined || ret === null) throw new NotFoundException();
    return ret;
  }
}
