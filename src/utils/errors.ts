import { PokemonTypes } from 'src/pokemons/schemas/pokemons.schema';

// Doesnt detect execution of these functions
/* istanbul ignore file */

export type Maybe<V, E> = { value?: V; errors?: E | E[] };

export const MUST_BE_NUMBER = (property) =>
  `${property} must be a number conforming to the specified constraints`;

export const MUST_BE_POSITIVE = (property) =>
  `${property} must be a positive number`;

export const MUST_BE_GREATER_OR_EQ = (property, value) =>
  `${property} must not be less than ${value}`;

export const MUST_BE_ONE_OF = (property, allowed) =>
  `${property} must be one of the following values: ${allowed.join(', ')}`;

export const MUST_BE_POKEMON_TYPE = (property) =>
  MUST_BE_ONE_OF(property, PokemonTypes);

export const MUST_VERIFY_REGEX = (property, regex) =>
  `${property} must match ${regex} regular expression`;

export const ARRAY_VERIFY_EACH = (property, restriction) =>
  `each value in ${restriction(property)}`;

export const ARRAY_MAX = (property, limit) =>
  `${property} must not contain more than ${limit} elements`;
