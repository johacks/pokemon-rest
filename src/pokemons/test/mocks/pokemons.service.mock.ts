import { Pokemon } from 'src/pokemons/schemas/pokemons.schema';
import { PokemonsService } from 'src/pokemons/services/pokemons.service';
import { POKEMON_STUB } from 'src/pokemons/test/stubs';
import { createMock } from '@golevelup/ts-jest';

export const EXISTING_POKEMON_ID = 'name::Seel';

export const pokemonServiceMock = createMock<PokemonsService>({
  findOne: jest.fn(async (pokemonPublicId: string): Promise<Pokemon> => {
    if (pokemonPublicId == EXISTING_POKEMON_ID) return POKEMON_STUB;
    else return undefined;
  }),

  findAll: jest.fn().mockResolvedValue({ count: 1, docs: [POKEMON_STUB] }),
});
