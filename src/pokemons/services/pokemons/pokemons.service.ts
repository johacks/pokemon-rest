import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Pokemon,
  PokemonDocument,
} from '../../schemas/pokemons/pokemons.schema';

@Injectable()
export class PokemonsService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<PokemonDocument>,
  ) {}

  async findAll(skip = 0, limit = Infinity): Promise<Pokemon[]> {
    return this.pokemonModel
      .find()
      .sort({ pokemonId: 1 })
      .skip(skip)
      .limit(limit);
  }

  async findOne(pokemonId: number): Promise<Pokemon> {
    return this.pokemonModel.findOne({ pokemonId: pokemonId }).exec();
  }
}
