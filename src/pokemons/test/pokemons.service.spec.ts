import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from 'src/pokemons/services/pokemons.service';
import { Model } from 'mongoose';
import { FILTER_PARAMS_STUB, POKEMON_STUB } from 'src/pokemons/test/stubs';
import { Pokemon, PokemonDocument } from 'src/pokemons/schemas/pokemons.schema';
import {
  EXISTING_NAME_ID,
  EXISTING_NUMBER_ID,
  FIND_Q,
  pokemonModelMock,
} from 'src/pokemons/test/mocks/pokemon.model.mock';
import { PaginatedItem } from 'src/utils/pagination';

describe('PokemonService', () => {
  let service: PokemonsService;
  let pokemonModel: Model<PokemonDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonsService,
        { provide: 'PokemonModel', useValue: pokemonModelMock() },
      ],
    }).compile();

    service = module.get<PokemonsService>(PokemonsService);
    pokemonModel = module.get<Model<PokemonDocument>>('PokemonModel');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const originalPopClean = PokemonsService.populateCleanQuery;
  const mockPopClean = jest.fn((query) => query);

  describe('findOne', () => {
    for (const nameOrNumber of [
      { desc: 'name', input: EXISTING_NAME_ID },
      { desc: 'number', input: EXISTING_NUMBER_ID },
    ]) {
      describe(`when called with existing pokemon ${nameOrNumber.desc}`, () => {
        let pokemon: Pokemon;
        beforeEach(async () => {
          PokemonsService.populateCleanQuery = mockPopClean;
          pokemon = await service.findOne(nameOrNumber.input);
          PokemonsService.populateCleanQuery = originalPopClean;
        });
        it('should call model find one', async () => {
          expect(pokemonModel.findOne).toHaveBeenCalled();
        });
        it('should populate and clean pokemon query', async () => {
          expect(mockPopClean).toHaveBeenCalled();
        });
        it('should return found pokemon', async () => {
          expect(pokemon).toBe(POKEMON_STUB);
        });
      });
    }
    describe(`when called with not existing pokemon id`, () => {
      let pokemon: Pokemon;
      beforeEach(async () => {
        PokemonsService.populateCleanQuery = mockPopClean;
        pokemon = await service.findOne('id::100000');
        PokemonsService.populateCleanQuery = originalPopClean;
      });
      it('should call model find one', async () => {
        expect(pokemonModel.findOne).toHaveBeenCalled();
      });
      it('should populate and clean pokemon query', async () => {
        expect(mockPopClean).toHaveBeenCalled();
      });
      it('should not return found pokemon', async () => {
        expect(pokemon).toBeNull();
      });
    });
  });

  describe('findAll', () => {
    let pokemons: PaginatedItem<Pokemon>;
    beforeEach(async () => {
      PokemonsService.populateCleanQuery = mockPopClean;
      pokemons = await service.findAll(FILTER_PARAMS_STUB);
      PokemonsService.populateCleanQuery = originalPopClean;
    });
    it('should call model find', async () => {
      expect(pokemonModel.find).toHaveBeenCalled();
    });
    it('should return paginated pokemons', async () => {
      expect(pokemons).toEqual({ count: 1, docs: [POKEMON_STUB] });
    });
    for (const numberFilter of ['fleeRate', 'maxCP', 'maxHP']) {
      it(`should detect ${numberFilter} filter`, async () => {
        expect(FIND_Q.find).toHaveBeenCalledWith(
          expect.objectContaining({
            [numberFilter]: {
              $gte: FILTER_PARAMS_STUB[`${numberFilter}Lower`],
              $lte: FILTER_PARAMS_STUB[`${numberFilter}Upper`],
            },
          }),
        );
      });
    }

    for (const typeFilter of ['resistant', 'weaknesses', 'types']) {
      it(`should detect ${typeFilter} filter`, async () => {
        expect(FIND_Q.find).toHaveBeenCalledWith(
          expect.objectContaining({
            [typeFilter]: { $all: FILTER_PARAMS_STUB[typeFilter] },
          }),
        );
      });
    }

    it('should detect skip param', async () => {
      expect(FIND_Q.skip).toHaveBeenCalledWith(FILTER_PARAMS_STUB.skip);
    });

    it('should detect limit param', async () => {
      expect(FIND_Q.limit).toHaveBeenCalledWith(FILTER_PARAMS_STUB.limit);
    });
  });
});
