import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PokemonsModule } from 'src/pokemons/pokemons.module';
import {
  ID_HEADER,
  NAME_HEADER,
  POKEMON_ID_REGEX,
  PokemonsService,
} from 'src/pokemons/services/pokemons.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfigManager } from 'src/database/ormconfig';
import { POKEMON_STUB } from 'src/pokemons/test/stubs';
import { DatabasePopulator } from 'src/database/populate';
import { Model } from 'mongoose';
import {
  PokemonDocument,
  PokemonType,
} from 'src/pokemons/schemas/pokemons.schema';
import { sortPokemonFields } from 'src/utils/generalfuncs';
import {
  MUST_BE_NUMBER,
  MUST_BE_POKEMON_TYPE,
  MUST_VERIFY_REGEX,
  ARRAY_MAX,
  ARRAY_VERIFY_EACH,
  MUST_BE_GREATER_OR_EQ,
  MUST_BE_POSITIVE,
} from 'src/utils/errors';

describe('Pokemons', () => {
  let app: INestApplication;
  let pokemonModel: Model<PokemonDocument>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        PokemonsModule,
        MongooseModule.forRootAsync({
          useFactory: async () =>
            new DatabaseConfigManager().getConnectionParameters(true),
        }),
      ],
      providers: [PokemonsService],
    }).compile();

    app = module.createNestApplication();
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    pokemonModel = module.get<Model<PokemonDocument>>('PokemonModel');
    await new DatabasePopulator(pokemonModel.db.getClient()).cleanPopulate();
  });

  describe(`/GET /pokemons`, () => {
    describe('when called with no query parameters', () => {
      let getPokemons;
      beforeEach(async () => {
        getPokemons = request.default(app.getHttpServer()).get('/pokemons');
      });
      it('should return code 200', async () => {
        return getPokemons.expect(200);
      });
      it('should contain 151 pokemon', async () => {
        return getPokemons.expect((res) => {
          expect(res.body.count).toEqual(151);
        });
      });
      it(`should contain ${POKEMON_STUB.name} pokemon`, async () => {
        return getPokemons.expect((res) => {
          res.body.docs = res.body.docs.map(sortPokemonFields);
          expect(res.body.docs).toEqual(expect.arrayContaining([POKEMON_STUB]));
        });
      });
    });

    describe('when called with query filter parameters', () => {
      const gteMatch = (value, filterValue) => value >= filterValue;
      const lteMatch = (value, filterValue) => value <= filterValue;
      const inMatch = (value, filterValue) =>
        filterValue.map((v) => value.includes(v)).every(Boolean);
      let getPokemons;

      describe('when values are correct', () => {
        const SKIP = 15;
        const LIMIT = 20;
        const testCases = [
          { filter: 'maxCPLower', value: 900, count: 111, match: gteMatch },
          { filter: 'maxCPUpper', value: 1200, count: 62, match: lteMatch },
          { filter: 'maxHPLower', value: 900, count: 121, match: gteMatch },
          { filter: 'maxHPUpper', value: 1200, count: 57, match: lteMatch },
          { filter: 'fleeRateLower', value: 0.1, count: 56, match: gteMatch },
          { filter: 'fleeRateUpper', value: 0.05, count: 15, match: lteMatch },
          {
            filter: 'types',
            value: [PokemonType.ELECTRIC],
            count: 9,
            match: inMatch,
          },
          {
            filter: 'types',
            value: [PokemonType.ELECTRIC, PokemonType.FLYING],
            count: 1,
            match: inMatch,
          },
          {
            filter: 'resistant',
            value: [PokemonType.FLYING],
            count: 20,
            match: inMatch,
          },
          {
            filter: 'resistant',
            value: [PokemonType.FLYING, PokemonType.GRASS],
            count: 3,
            match: inMatch,
          },
          {
            filter: 'weaknesses',
            value: [PokemonType.FLYING],
            count: 32,
            match: inMatch,
          },
          {
            filter: 'weaknesses',
            value: [PokemonType.FLYING, PokemonType.GRASS],
            count: 1,
            match: inMatch,
          },
        ].map((testCase) => {
          const filter = testCase.filter;
          if (filter.endsWith('Upper') || filter.endsWith('Lower')) {
            return {
              ...testCase,
              name: filter.substring(0, filter.length - 'Upper'.length),
            };
          }
          return { ...testCase, name: testCase.filter };
        });

        for (const test of testCases) {
          const query = `${test.filter}=${test.value}`;
          describe(`with filter ${query}`, () => {
            beforeEach(async () => {
              getPokemons = request
                .default(app.getHttpServer())
                .get(`/pokemons/?${query}`);
            });
            it('should return status 200', async () => {
              return getPokemons.expect(200);
            });
            it(`should return ${test.count} pokemon`, async () => {
              return getPokemons.expect((res) =>
                expect(res.body.count).toEqual(test.count),
              );
            });
            it('should return pokemon matching filter', async () => {
              return getPokemons.expect((res) =>
                expect(
                  res.body.docs
                    .map((pokemon) =>
                      test.match(pokemon[test.name], test.value),
                    )
                    .every(Boolean),
                ).toBe(true),
              );
            });
          });
        }

        describe(`with skip=${SKIP}, limit=${LIMIT}`, () => {
          beforeEach(async () => {
            getPokemons = request
              .default(app.getHttpServer())
              .get(`/pokemons/?skip=${SKIP}&limit=${LIMIT}`);
          });
          it('should return status 200', async () => {
            return getPokemons.expect(200);
          });
          it(`should include all 151 pokemon in count`, async () => {
            return getPokemons.expect((res) =>
              expect(res.body.count).toEqual(151),
            );
          });
          it(`should return ${LIMIT} pokemon`, async () => {
            return getPokemons.expect((res) =>
              expect(res.body.docs.length).toEqual(LIMIT),
            );
          });
          it(`should have first pokemon with id ${SKIP + 1}`, async () => {
            return getPokemons.expect((res) =>
              expect(res.body.docs[0].pokemonId).toEqual(SKIP + 1),
            );
          });
        });
      });

      describe('when values are incorrect', () => {
        const testCases = [
          { param: 'maxCPLower', value: 'foo', message: MUST_BE_NUMBER },
          { param: 'maxCPUpper', value: 'foo', message: MUST_BE_NUMBER },
          { param: 'maxHPLower', value: 'foo', message: MUST_BE_NUMBER },
          { param: 'maxHPUpper', value: 'foo', message: MUST_BE_NUMBER },
          { param: 'fleeRateLower', value: 'foo', message: MUST_BE_NUMBER },
          { param: 'fleeRateUpper', value: 'foo', message: MUST_BE_NUMBER },
          {
            param: 'types',
            value: [PokemonType.GRASS, 'Foo'],
            message: (prop) => ARRAY_VERIFY_EACH(prop, MUST_BE_POKEMON_TYPE),
          },
          {
            // Only allowed two types
            param: 'types',
            value: [PokemonType.GRASS, PokemonType.FLYING, PokemonType.FIRE],
            message: (prop) => ARRAY_MAX(prop, 2),
          },
          {
            param: 'skip',
            value: -1,
            message: (prop) => MUST_BE_GREATER_OR_EQ(prop, 0),
          },
          { param: 'skip', value: 'foo', message: MUST_BE_NUMBER },
          { param: 'limit', value: 'foo', message: MUST_BE_POSITIVE },
        ];
        for (const test of testCases) {
          const query = `${test.param}=${test.value}`;
          describe(`with filter ${query}`, () => {
            beforeEach(async () => {
              getPokemons = request
                .default(app.getHttpServer())
                .get(`/pokemons/?${query}`);
            });
            it('should return status 400 bad request', async () => {
              return getPokemons.expect(400);
            });
            it('should return appropiate error message', async () => {
              getPokemons.expect((res) =>
                expect(res.body.message).toContain(test.message(test.param)),
              );
            });
          });
        }
      });
    });
  });

  describe('/GET /pokemons/<id>', () => {
    describe('when called with existing pokemon', () => {
      for (const idOrName of [
        { desc: 'by name', id: `${NAME_HEADER}${POKEMON_STUB.name}` },
        { desc: 'by pokemonId', id: `${ID_HEADER}${POKEMON_STUB.pokemonId}` },
      ]) {
        describe(idOrName.desc, () => {
          let getPokemon: request.Test;
          beforeEach(async () => {
            getPokemon = request
              .default(app.getHttpServer())
              .get(`/pokemons/${idOrName.id}`);
          });
          it('should return code 200', async () => {
            return getPokemon.expect(200);
          });
          it(`should contain ${POKEMON_STUB.name} pokemon`, async () => {
            return getPokemon.expect((res) => {
              res.body = sortPokemonFields(res.body);
              expect(res.body).toEqual(POKEMON_STUB);
            });
          });
        });
      }
    });
    describe('when correctly called with not existing pokemon', () => {
      let getPokemon: request.Test;
      beforeEach(async () => {
        getPokemon = request
          .default(app.getHttpServer())
          .get(`/pokemons/name::foobar`);
      });
      it('should return code 404 not found', async () => {
        return getPokemon.expect(404);
      });
    });
    describe('when called with bad public id syntax', () => {
      let getPokemon: request.Test;
      beforeEach(async () => {
        getPokemon = request
          .default(app.getHttpServer())
          .get(`/pokemons/Bulbasaur`);
      });
      it('should return code 400 bad request', async () => {
        return getPokemon.expect(400);
      });
      it('should indicate appropiate syntax in the response', async () => {
        return getPokemon.expect((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              message: expect.arrayContaining([
                MUST_VERIFY_REGEX('id', POKEMON_ID_REGEX.toString()),
              ]),
            }),
          );
        });
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
