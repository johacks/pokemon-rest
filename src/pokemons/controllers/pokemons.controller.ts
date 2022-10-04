import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PokemonsService } from 'src/pokemons/services/pokemons.service';
import {
  FilterParams,
  POKEMON_ID_REGEX,
  PokemonPublicId,
} from 'src/pokemons/validators/pokemons.validators';
import {
  Pokemon,
  PokemonType,
  PokemonTypes,
} from 'src/pokemons/schemas/pokemons.schema';
import { PaginatedItem, PokemonPaginationSchema } from 'src/utils/pagination';
import {
  ApiBadRequestResponse,
  ApiDefaultResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { POKEMON_ID_SCHEMA } from 'src/users/controllers/favorites.controller';
import {
  ARRAY_MAX,
  ErrorSchema,
  MUST_BE_GREATER_OR_EQ,
  MUST_BE_NUMBER,
  MUST_BE_POKEMON_TYPE,
  MUST_BE_POSITIVE,
  MUST_VERIFY_REGEX,
} from 'src/utils/errors';

class NotFoundErrorSchema extends ErrorSchema {
  @ApiProperty({ default: 'Not Found' })
  message: string;

  @ApiProperty({ default: 404 })
  statusCode: number;
}

class BadRequestSchemaFindOne extends ErrorSchema {
  @ApiProperty({
    default: [MUST_VERIFY_REGEX('id', POKEMON_ID_REGEX.toString())],
  })
  message: string[];

  @ApiProperty({ default: 400 })
  statusCode: number;
}

class BadRequestSchemaFindAll extends ErrorSchema {
  @ApiProperty({
    enum: [
      MUST_BE_NUMBER('maxHPLower'),
      MUST_BE_NUMBER('maxHPUpper'),
      MUST_BE_NUMBER('maxCPLower'),
      MUST_BE_NUMBER('maxCPUpper'),
      MUST_BE_NUMBER('fleeRateLower'),
      MUST_BE_NUMBER('fleeRateUpper'),
      MUST_BE_NUMBER('skip'),
      MUST_BE_POSITIVE('limit'),
      MUST_BE_GREATER_OR_EQ('skip', 0),
      MUST_BE_POKEMON_TYPE('types'),
      MUST_BE_POKEMON_TYPE('resistant'),
      MUST_BE_POKEMON_TYPE('weaknesses'),
      ARRAY_MAX('types', 2),
    ],
    isArray: true,
  })
  message: string[];

  @ApiProperty({ default: 400 })
  statusCode: number;
}

@ApiTags('pokemons')
@Controller('pokemons')
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  // findAll (search filters)

  @ApiOperation({ operationId: 'searchPokemon' })
  @ApiOkResponse({
    description: 'Search results.',
    type: PokemonPaginationSchema,
  })
  @ApiBadRequestResponse({
    description: 'Error in query parameters',
    type: BadRequestSchemaFindAll,
  })
  @Get('/')
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    filterParams: FilterParams,
  ): Promise<PaginatedItem<Pokemon>> {
    return this.pokemonsService.findAll(filterParams);
  }

  // getTypes

  @ApiOperation({ operationId: 'getPokemonTypes' })
  @ApiOkResponse({
    isArray: true,
    description: 'All existing Pokemon types.',
    schema: { example: PokemonTypes, type: 'string' },
  })
  @Get('/types/')
  async getTypes(): Promise<PokemonType[]> {
    return PokemonTypes;
  }

  // findOne

  @ApiOperation({ operationId: 'getPokemon' })
  @ApiParam({
    name: 'id',
    ...POKEMON_ID_SCHEMA,
  })
  @ApiOkResponse({
    type: Pokemon,
    description: 'Found Pokemon',
  })
  @ApiNotFoundResponse({
    type: NotFoundErrorSchema,
    description: 'Pokemon not found',
  })
  @ApiBadRequestResponse({
    type: BadRequestSchemaFindOne,
    description: 'The param id doesnt match the specified syntax',
  })
  @Get(':id')
  async findOne(@Param() id: PokemonPublicId): Promise<Pokemon> {
    const ret = await this.pokemonsService.findOne(id.id);
    if (!ret) throw new NotFoundException();
    return ret;
  }
}
