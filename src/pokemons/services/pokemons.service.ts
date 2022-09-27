import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Pokemon,
  PokemonDocument,
  PokemonType,
  PokemonTypes,
} from '../schemas/pokemons.schema';
import { PaginationParams } from '../../utils/pagination';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { FilterParams } from '../validators/pokemons.validators';

// We allow an id and name identification, e.g. id::001 or name::bulbasaur
export const NAME_HEADER = 'name::';
export const ID_HEADER = 'id::';
export const POKEMON_ID_REGEX = new RegExp(`${NAME_HEADER}|${ID_HEADER}[0-9]+`);

// We populate the fields but try not to bloat with too much information
// Client can request details if needed of the embedded entities.
const pokemonPopulatedFields = [
  // We do not show internal id to avoid confusion
  { path: 'evolutions', select: { name: 1, pokemonId: 1, _id: 0 } },
  { path: 'previousEvolutions', select: { name: 1, pokemonId: 1, _id: 0 } },
  // As long as an attack entity does not exist better not to show the id
  // to avoid confusion
  { path: 'attacks.special', select: { _id: 0 } },
  { path: 'attacks.fast', select: { _id: 0 } },
];

const pokemonFieldSelection = {
  _id: 0,
  'attacks._id': 0,
  'weight._id': 0,
  'height._id': 0,
  'evolutionRequirements._id': 0,
};

@Injectable()
export class PokemonsService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<PokemonDocument>,
  ) {}

  // Populate pokemon nested fields and select which fields to include
  public static populateCleanQuery(q) {
    for (const populateOptions of pokemonPopulatedFields) {
      q.populate(populateOptions);
    }
    return q.select(pokemonFieldSelection);
  }

  // Get list of pokemon applying filters
  async findAll(filterParams: FilterParams): Promise<Pokemon[]> {
    const q = this.pokemonModel.find({
      fleeRate: {
        $gte: filterParams.fleeRateLower ?? -Infinity,
        $lte: filterParams.fleeRateUpper ?? Infinity,
      },
      maxCP: {
        $gte: filterParams.maxCPLower ?? -Infinity,
        $lte: filterParams.maxCPUpper ?? Infinity,
      },
      maxHP: {
        $gte: filterParams.maxHPLower ?? -Infinity,
        $lte: filterParams.maxHPUpper ?? Infinity,
      },
    });

    // Pokemon with all specified weaknesses or immunities
    if (filterParams.resistant) {
      q.find({ resistant: { $all: filterParams.resistant } });
    }
    if (filterParams.weaknesses) {
      q.find({ weaknesses: { $all: filterParams.weaknesses } });
    }

    // Pokemon with both specified types or one of a specified type.
    // Doesnt allow to search for pokemon of only one specific type,
    // but given expected data volume, it should be easy enough to filter out
    // pokemon with two types on the client.
    if (filterParams.types) {
      q.find({ types: { $all: filterParams.types } });
    }

    // Simple pagination scheme with skip and limit
    q.sort({ pokemonId: 1 })
      .skip(filterParams.skip ?? 0)
      .limit(filterParams.limit ?? Infinity);
    return PokemonsService.populateCleanQuery(q).exec();
  }

  async findOne(pokemonPublicId: string): Promise<Pokemon> {
    const q = this.pokemonModel.find(
      PokemonsService.makeFilterByPublicId(pokemonPublicId),
    );
    return PokemonsService.populateCleanQuery(q).exec();
  }

  public static makeFilterByPublicId(pokemonPublicId: string) {
    if (pokemonPublicId.startsWith(NAME_HEADER)) {
      return { name: pokemonPublicId.substring(NAME_HEADER.length) };
    } else {
      return {
        pokemonId: parseInt(pokemonPublicId.substring(ID_HEADER.length)),
      };
    }
  }
}
