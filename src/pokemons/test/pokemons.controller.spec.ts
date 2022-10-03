import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsController } from 'src/pokemons/controllers/pokemons.controller';
import { Pokemon, PokemonTypes } from 'src/pokemons/schemas/pokemons.schema';
import { PokemonsService } from 'src/pokemons/services/pokemons.service';
import {
  EXISTING_POKEMON_ID,
  pokemonServiceMock,
} from 'src/pokemons/test/mocks/pokemons.service.mock';
import { FILTER_PARAMS_STUB, POKEMON_STUB } from 'src/pokemons/test/stubs';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PokemonController', () => {
  // VARIABLES AND MOCKS

  let controller: PokemonsController;
  let service: PokemonsService;

  // PRE-TEST SETUPS

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PokemonsService, useValue: pokemonServiceMock() }],
      controllers: [PokemonsController],
    }).compile();

    controller = module.get<PokemonsController>(PokemonsController);
    service = module.get<PokemonsService>(PokemonsService);
  });

  // UNIT TESTS

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getTypes', () => {
    it('should return all types', async () => {
      const types = await controller.getTypes();
      expect(types).toEqual(PokemonTypes);
    });
  });

  describe('findOne', () => {
    describe('when existing Pokemon', () => {
      let pokemon: Pokemon;
      beforeEach(async () => {
        pokemon = await controller.findOne({ id: EXISTING_POKEMON_ID });
      });

      it('should call pokemon service', async () => {
        expect(service.findOne).toHaveBeenCalledWith(EXISTING_POKEMON_ID);
      });

      it('should return found pokemon', async () => {
        expect(pokemon).toEqual(POKEMON_STUB);
      });
    });

    describe('when non-existing Pokemon', () => {
      it('should raise not found exception', async () => {
        const call = async () => controller.findOne({ id: 'foo' });
        await expect(call).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('findAll', () => {
    let result;
    beforeEach(async () => {
      result = await controller.findAll(FILTER_PARAMS_STUB);
    });
    it('should call pokemon service', async () => {
      expect(service.findAll).toHaveBeenCalledWith(FILTER_PARAMS_STUB);
    });
    it('should return paginated list of pokemons', async () => {
      expect(result).toEqual({ count: 1, docs: [POKEMON_STUB] });
    });
  });
});
