import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  POKEMON_ID_REGEX,
  PokemonPublicId,
} from '../../pokemons/controllers/pokemons.controller';
import {
  FavoritesService,
  FavoritesServiceErrors,
} from '../services/favorites.service';
import { Pokemon } from '../../pokemons/schemas/pokemons.schema';
import { IsString, Matches } from 'class-validator';

// URL parameters of delete endpoint
class DeleteParams {
  @Matches(POKEMON_ID_REGEX)
  @IsString()
  pokemonId: string;

  @IsString()
  userId: string;
}

@Controller('users/:userId/favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('/')
  async create(
    @Param('userId') userId: string,
    @Body() createFavoriteDto: PokemonPublicId,
  ): Promise<Pokemon[]> {
    const { pokemons, error } = await this.favoritesService.create(
      userId,
      createFavoriteDto.id,
    );
    if (pokemons) return pokemons;
    if (error === FavoritesServiceErrors.USER_NOT_FOUND) {
      throw new NotFoundException('User not found');
    } else if (error === FavoritesServiceErrors.POKEMON_NOT_FOUND) {
      throw new NotFoundException('Pokemon not found');
    } else if (error === FavoritesServiceErrors.DUPLICATE_POKEMON) {
      throw new BadRequestException('Duplicate favorite');
    } else {
      return [];
    }
  }

  @Delete('/:pokemonId')
  async delete(@Param() deleteParams: DeleteParams): Promise<Pokemon[]> {
    const { pokemons, error } = await this.favoritesService.delete(
      deleteParams.userId,
      deleteParams.pokemonId,
    );
    if (pokemons) return pokemons;
    if (error === FavoritesServiceErrors.USER_NOT_FOUND) {
      throw new NotFoundException('User not found');
    } else if (error === FavoritesServiceErrors.POKEMON_NOT_FOUND) {
      throw new NotFoundException('Pokemon not found');
    } else if (error === FavoritesServiceErrors.POKEMON_NOT_FAVORITE) {
      throw new BadRequestException('Pokemon not in user favorites');
    } else {
      return [];
    }
  }

  @Get('/')
  async findAll(@Param('userId') userId: string): Promise<Pokemon[]> {
    const { pokemons, error } = await this.favoritesService.findAll(userId);

    if (pokemons) return pokemons;
    if (error === FavoritesServiceErrors.USER_NOT_FOUND) {
      throw new NotFoundException('User not found');
    } else {
      return [];
    }
  }
}
