import { createMock } from '@golevelup/ts-jest';
import { PokemonDocument } from 'src/pokemons/schemas/pokemons.schema';
import { Model } from 'mongoose';

export const pokemonModelMock = createMock<Model<PokemonDocument>>({});
