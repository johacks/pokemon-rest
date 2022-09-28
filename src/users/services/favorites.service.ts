import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { PokemonsService } from 'src/pokemons/services/pokemons.service';
import { Pokemon, PokemonDocument } from 'src/pokemons/schemas/pokemons.schema';

export enum FavoritesServiceErrors {
  USER_NOT_FOUND,
  POKEMON_NOT_FOUND,
  DUPLICATE_POKEMON,
  POKEMON_NOT_FAVORITE,
}

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<PokemonDocument>,
  ) {}

  async create(
    userId: string,
    pokemonPublicId: string,
  ): Promise<{ pokemons?: Pokemon[]; error?: FavoritesServiceErrors }> {
    // We need pokemon object to make public-private id association
    const { user, pokemon, error } = await this.getUserAndPokemon(
      userId,
      pokemonPublicId,
    );
    if (error) return { error: error };

    if (user.favoritePokemons.includes(pokemon._id)) {
      return { error: FavoritesServiceErrors.DUPLICATE_POKEMON };
    }
    user.favoritePokemons.push(pokemon._id);
    await user.save();
    return { pokemons: await this.listFavorites(user) };
  }

  async delete(
    userId: string,
    pokemonPublicId: string,
  ): Promise<{ pokemons?: Pokemon[]; error?: FavoritesServiceErrors }> {
    // We need pokemon object to make public-private id association
    const { user, pokemon, error } = await this.getUserAndPokemon(
      userId,
      pokemonPublicId,
    );
    if (error) return { error: error };

    const idx = user.favoritePokemons.indexOf(pokemon._id);
    if (idx < 0) return { error: FavoritesServiceErrors.POKEMON_NOT_FAVORITE };
    user.favoritePokemons.splice(idx, 1);
    await user.save();
    return { pokemons: await this.listFavorites(user) };
  }

  async findAll(
    userId: string,
  ): Promise<{ pokemons?: Pokemon[]; error?: FavoritesServiceErrors }> {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) return { error: FavoritesServiceErrors.USER_NOT_FOUND };
    return { pokemons: await this.listFavorites(user) };
  }

  // Some utility functions to avoid code repetition

  private async listFavorites(user: User) {
    const favoritesDetail = this.pokemonModel.find({
      _id: { $in: user.favoritePokemons },
    });
    return PokemonsService.populateCleanQuery(favoritesDetail);
  }

  private async getUserAndPokemon(
    userId: string,
    pokemonPublicId: string,
  ): Promise<{
    user?: UserDocument;
    pokemon?: PokemonDocument;
    error?: FavoritesServiceErrors;
  }> {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) return { error: FavoritesServiceErrors.USER_NOT_FOUND };
    const pokemon = await this.pokemonModel.findOne(
      PokemonsService.makeFilterByPublicId(pokemonPublicId),
    );
    if (!pokemon) return { error: FavoritesServiceErrors.POKEMON_NOT_FOUND };
    user.favoritePokemons = user?.favoritePokemons ?? [];
    return { user: user, pokemon: pokemon };
  }
}
