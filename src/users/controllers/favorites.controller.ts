import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  FavoritesService,
  FavoritesServiceErrors,
} from '../services/favorites.service';
import { Pokemon } from '../../pokemons/schemas/pokemons.schema';
import { UsersService } from '../services/users.service';
import { PokemonPublicId } from '../../pokemons/validators/pokemons.validators';

// Body of create favortie endpoint
class CreateFavoriteDto extends PokemonPublicId {}
// URL parameters of delete endpoint, right now
class DeleteParams extends CreateFavoriteDto {}

@Controller('users/favorites')
@Injectable()
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly usersService: UsersService,
  ) {}

  private detectError(error) {
    if (error === FavoritesServiceErrors.USER_NOT_FOUND) {
      throw new NotFoundException('User no longer exists');
    } else if (error === FavoritesServiceErrors.POKEMON_NOT_FOUND) {
      throw new NotFoundException('Pokemon not found');
    } else if (error === FavoritesServiceErrors.DUPLICATE_POKEMON) {
      throw new BadRequestException('Duplicate favorite');
    } else if (error === FavoritesServiceErrors.POKEMON_NOT_FAVORITE) {
      throw new BadRequestException('Pokemon not in user favorites');
    }
  }

  @Post('/')
  async create(
    @Body() createFavoriteDto: CreateFavoriteDto,
  ): Promise<Pokemon[]> {
    const userId = (await this.usersService.authenticate())._id;
    const { pokemons, error } = await this.favoritesService.create(
      userId,
      createFavoriteDto.id,
    );
    this.detectError(error);
    return pokemons ?? [];
  }

  @Delete('/:id')
  async delete(@Param() deleteParams: DeleteParams): Promise<Pokemon[]> {
    const userId = (await this.usersService.authenticate())._id;
    const { pokemons, error } = await this.favoritesService.delete(
      userId,
      deleteParams.id,
    );
    this.detectError(error);
    return pokemons ?? [];
  }

  @Get('/')
  async findAll(): Promise<Pokemon[]> {
    const userId = (await this.usersService.authenticate())._id;
    const { pokemons, error } = await this.favoritesService.findAll(userId);
    this.detectError(error);
    return pokemons ?? [];
  }
}
