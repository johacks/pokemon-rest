import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Pokemon,
  PokemonDocument,
} from '../../schemas/pokemons/pokemons.schema';
import { PaginationParams } from '../../../utils/pagination';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterParams extends PaginationParams {
  @IsOptional()
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  name?: string;
}

@Injectable()
export class PokemonsService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<PokemonDocument>,
  ) {}

  async findAll(filterParams: FilterParams): Promise<Pokemon[]> {
    /*
     * Returns a collection even though name is unique, but at least adjusts
     * better to REST standards than something like "pokemons/by/name/<thename>"
     * Both solutions can be tough for the client in different ways, but I would
     * prefer this one as it makes the API consistent with a well-known standard
     * */
    if (filterParams.name) {
      return this.pokemonModel.find({ name: filterParams.name });
    }
    const q = this.pokemonModel
      .find()
      .sort({ pokemonId: 1 })
      .skip(filterParams.skip ?? 0)
      .limit(filterParams.limit ?? Infinity);
    return q.exec();
  }

  async findOne(pokemonId: number): Promise<Pokemon> {
    return this.pokemonModel.findOne({ pokemonId: pokemonId }).exec();
  }
}
