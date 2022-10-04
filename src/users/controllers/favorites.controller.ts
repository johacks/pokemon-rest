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
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  FavoritesService,
  FavoritesServiceErrors,
} from 'src/users/services/favorites.service';
import { Pokemon } from 'src/pokemons/schemas/pokemons.schema';
import { PokemonPublicId } from 'src/pokemons/validators/pokemons.validators';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { IGetUserAuthInfoRequest } from 'src/utils/request';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiProperty,
  ApiResponse,
  ApiTags,
  PartialType,
  PickType,
} from '@nestjs/swagger';

// Body of create favortie endpoint
export const POKEMON_ID_SCHEMA = {
  type: String,
  description: 'either id::"pokemon number" or name::"pokemon name"',
  examples: {
    'by name': { value: 'name::Bulbasaur' },
    'by id': { value: 'id::1' },
  },
};
const POKEMON_ID_PROPERTY = {
  ...POKEMON_ID_SCHEMA,
  examples: [
    POKEMON_ID_SCHEMA.examples['by id'].value,
    POKEMON_ID_SCHEMA.examples['by name'].value,
  ],
};

class CreateFavoriteDto extends PokemonPublicId {
  @ApiProperty(POKEMON_ID_PROPERTY)
  id: string;
}
// URL parameters of delete endpoint
class DeleteParams extends PickType(CreateFavoriteDto, ['id'] as const) {}

@ApiTags('users', 'pokemons')
@Controller('users/favorites')
@Injectable()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

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

  @ApiBody({ type: CreateFavoriteDto })
  @ApiCreatedResponse({
    description: 'Correctly added new Pokemon to authenticated user favorites',
    type: Pokemon,
  })
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Body() createFavoriteDto: CreateFavoriteDto,
    @Req() req,
  ): Promise<Pokemon[]> {
    const userId = req.user.userId;
    const { value: pokemons, errors } = await this.favoritesService.create(
      userId,
      createFavoriteDto.id,
    );
    this.detectError(errors);
    return pokemons ?? [];
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(
    @Param() deleteParams: DeleteParams,
    @Req() req,
  ): Promise<Pokemon[]> {
    const userId = req.user.userId;
    const { value: pokemons, errors } = await this.favoritesService.delete(
      userId,
      deleteParams.id,
    );
    this.detectError(errors);
    return pokemons ?? [];
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findAll(@Req() req: IGetUserAuthInfoRequest): Promise<Pokemon[]> {
    const userId = req.user.userId;
    const { value: pokemons, errors } = await this.favoritesService.findAll(
      userId,
    );
    this.detectError(errors);
    return pokemons ?? [];
  }
}
