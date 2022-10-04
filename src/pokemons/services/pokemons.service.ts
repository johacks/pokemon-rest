import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon, PokemonDocument } from 'src/pokemons/schemas/pokemons.schema';
import { FilterParams, ID_HEADER, NAME_HEADER } from 'src/pokemons/validators/pokemons.validators';
import { PaginatedItem } from 'src/utils/pagination';



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
  static populateCleanQuery(q) {
    for (const populateOptions of pokemonPopulatedFields) {
      q.populate(populateOptions);
    }
    return q.select(pokemonFieldSelection);
  }

  // Get list of pokemon applying filters
  async findAll(filterParams: FilterParams): Promise<PaginatedItem<Pokemon>> {
    const q = this.pokemonModel.find();
    q.find({
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
    const count = q.model.find().merge(q).countDocuments();
    q.skip(filterParams.skip).limit(filterParams.limit);
    return {
      docs: await PokemonsService.populateCleanQuery(q).exec(),
      count: await count,
    };
  }

  async findOne(pokemonPublicId: string): Promise<Pokemon> {
    const q = this.pokemonModel.findOne(
      PokemonsService.makeFilterByPublicId(pokemonPublicId),
    );
    return PokemonsService.populateCleanQuery(q).exec();
  }

  static makeFilterByPublicId(pokemonPublicId: string) {
    if (pokemonPublicId.startsWith(NAME_HEADER)) {
      return { name: pokemonPublicId.substring(NAME_HEADER.length) };
    } else {
      return {
        pokemonId: parseInt(pokemonPublicId.substring(ID_HEADER.length)),
      };
    }
  }
}
