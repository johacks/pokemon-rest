import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { PokemonPublicId } from '../../pokemons/controllers/pokemons.controller';
import {
  FavoritesService,
  FavoritesServiceErrors,
} from '../services/favorites.service';
import { User } from '../schemas/users.schema';
import { Pokemon } from "../../pokemons/schemas/pokemons.schema";

class CreateFavoriteDto extends PokemonPublicId {}

@Controller('users/:userId/favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('/')
  async create(
    @Param('userId') userId: string,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ): Promise<Pokemon[]> {
    const ret = await this.favoritesService.create(
      userId,
      createFavoriteDto.id,
    );
    if (ret === FavoritesServiceErrors.USER_NOT_FOUND) {
      throw new NotFoundException('User not found');
    } else if (ret === FavoritesServiceErrors.POKEMON_NOT_FOUND) {
      throw new NotFoundException('Pokemon not found');
    } else if (ret === FavoritesServiceErrors.DUPLICATE_POKEMON) {
      throw new BadRequestException('Duplicate favorite');
    }
    return ret;
  }
}
