import { Pokemon } from 'src/pokemons/schemas/pokemons.schema';
import _ from 'lodash';

export function sortPokemonFields(pokemon: Pokemon): Pokemon {
  return {
    ...pokemon,
    resistant: pokemon.resistant.sort(),
    weaknesses: pokemon.weaknesses.sort(),
    types: pokemon.types.sort(),
    evolutions: _.sortBy(pokemon.evolutions, 'name'),
    previousEvolutions: _.sortBy(pokemon.previousEvolutions, 'name'),
    attacks: {
      ...pokemon.attacks,
      fast: _.sortBy(pokemon.attacks.fast, 'name'),
      special: _.sortBy(pokemon.attacks.special, 'name'),
    },
  };
}
