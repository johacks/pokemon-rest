import { createMock } from '@golevelup/ts-jest';
import { PokemonDocument } from 'src/pokemons/schemas/pokemons.schema';
import { Model, Query } from 'mongoose';
import { POKEMON_STUB } from 'src/pokemons/test/stubs';

export const EXISTING_NAME = 'Seel';
export const EXISTING_NUMBER = 86;
export const EXISTING_NAME_ID = `name::${EXISTING_NAME}`;
export const EXISTING_NUMBER_ID = `id::${EXISTING_NUMBER}`;

export const FIND_ONE_Q_EXISTING = createMock<Query<any, any>>({
  exec: jest.fn().mockResolvedValue(POKEMON_STUB),
});
export const FIND_ONE_Q_NOT_EXISTING = createMock<Query<any, any>>({
  exec: jest.fn().mockResolvedValue(null),
});

export const FIND_Q = createMock<Query<any, any>>({
  exec: jest.fn().mockResolvedValue([POKEMON_STUB]),
  countDocuments: jest.fn().mockResolvedValue(1),
});
FIND_Q.merge = jest.fn().mockReturnValue(FIND_Q);
FIND_Q.skip = jest.fn().mockReturnValue(FIND_Q);
FIND_Q.limit = jest.fn().mockReturnValue(FIND_Q);
FIND_Q.model = createMock<Model<PokemonDocument>>({
  find: jest.fn().mockReturnValue(FIND_Q),
});

export const pokemonModelMock = () =>
  createMock<Model<PokemonDocument>>({
    findOne: jest.fn((filter, callback?) => {
      if (filter.name === EXISTING_NAME || filter.pokemonId === EXISTING_NUMBER)
        return FIND_ONE_Q_EXISTING;
      return FIND_ONE_Q_NOT_EXISTING;
    }),
    find: jest.fn().mockReturnValue(FIND_Q),
  });
