import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { PokemonsService } from '../../pokemons/services/pokemons.service';
import { Pokemon } from '../../pokemons/schemas/pokemons.schema';

export enum FavoritesServiceErrors {
  USER_NOT_FOUND,
  POKEMON_NOT_FOUND,
  DUPLICATE_POKEMON,
}

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<UserDocument>,
  ) {}

  async create(
    userId: string,
    pokemonPublicId: string,
  ): Promise<Pokemon[] | FavoritesServiceErrors> {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) return FavoritesServiceErrors.USER_NOT_FOUND;
    const pokemon = await this.pokemonModel
      .findOne(PokemonsService.makePokemonPublicIdFilter(pokemonPublicId))
      .lean();
    if (!pokemon) return FavoritesServiceErrors.POKEMON_NOT_FOUND;

    user.favoritePokemons = user?.favoritePokemons ?? [];
    // Internally, we use the private pokemonId. This helps us use methods
    // like mongoose populate.
    if (user.favoritePokemons.includes(pokemon._id)) {
      return FavoritesServiceErrors.DUPLICATE_POKEMON;
    }
    user.favoritePokemons.push(pokemon._id);
    user.save();
    // Return detailed information of favorite pokemon
    const favoritesDetail = this.pokemonModel.find({
      _id: { $in: user.favoritePokemons },
    });
    return PokemonsService.transformPokemonQuery(favoritesDetail);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
