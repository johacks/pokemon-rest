import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from 'src/pokemons/services/pokemons.service';
import { Model } from 'mongoose';
import { POKEMON_STUB } from 'src/pokemons/test/stubs';
import { PokemonDocument } from 'src/pokemons/schemas/pokemons.schema';
import { createMock } from '@golevelup/ts-jest';
import { pokemonModelMock } from 'src/pokemons/test/mocks/pokemon.model.mock';

describe('PokemonService', () => {
  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonsService,
        { provide: 'PokemonModel', useValue: pokemonModelMock },
      ],
    }).compile();

    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
