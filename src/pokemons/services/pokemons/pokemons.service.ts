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

  async findAll(): Promise<Pokemon[]> {
    return this.pokemonModel.find().exec();
  }

  async findOne(pokemonId: number): Promise<Pokemon> {
    return this.pokemonModel.findOne({ pokemonId: pokemonId }).exec();
  }
}
