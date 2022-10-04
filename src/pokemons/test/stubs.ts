import { Pokemon, PokemonType } from 'src/pokemons/schemas/pokemons.schema';
import { FilterParams } from 'src/pokemons/validators/pokemons.validators';
import { sortPokemonFields } from 'src/utils/generalfuncs';

export const POKEMON_STUB: Pokemon = sortPokemonFields({
  name: 'Seel',
  classification: 'Sea Lion Pokémon',
  types: [PokemonType.WATER],
  resistant: [
    PokemonType.FIRE,
    PokemonType.WATER,
    PokemonType.ICE,
    PokemonType.STEEL,
  ],
  weaknesses: [PokemonType.ELECTRIC, PokemonType.GRASS],
  weight: {
    minimum: '78.75kg',
    maximum: '101.25kg',
  },
  height: {
    minimum: '0.96m',
    maximum: '1.24m',
  },
  fleeRate: 0.09,
  evolutionRequirements: {
    amount: 50,
    name: 'Seel candies',
  },
  evolutions: [
    {
      name: 'Dewgong',
      pokemonId: 87,
    },
  ],
  maxCP: 985,
  maxHP: 1107,
  attacks: {
    fast: [
      {
        damage: 6,
        name: 'Water Gun',
        type: PokemonType.WATER,
      },
      {
        damage: 15,
        name: 'Ice Shard',
        type: PokemonType.ICE,
      },
    ],
    special: [
      {
        damage: 45,
        name: 'Aqua Tail',
        type: PokemonType.WATER,
      },
      {
        damage: 25,
        name: 'Icy Wind',
        type: PokemonType.ICE,
      },
      {
        damage: 25,
        name: 'Aqua Jet',
        type: PokemonType.WATER,
      },
    ],
  },
  pokemonId: 86,
  previousEvolutions: [],
});

export const FILTER_PARAMS_STUB: FilterParams = {
  skip: 1,
  limit: 1,
  fleeRateLower: 0,
  fleeRateUpper: 1,
  types: [PokemonType.WATER],
  resistant: [PokemonType.STEEL],
  weaknesses: [PokemonType.ELECTRIC],
  maxCPLower: POKEMON_STUB.maxCP,
  maxCPUpper: POKEMON_STUB.maxCP,
  maxHPLower: POKEMON_STUB.maxHP,
  maxHPUpper: POKEMON_STUB.maxHP,
};
