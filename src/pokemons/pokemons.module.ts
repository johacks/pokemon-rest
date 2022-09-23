import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonsController } from './controllers/pokemons.controller';
import { PokemonsService } from './services/pokemons.service';
import {
  Attack,
  AttackSchema,
  Pokemon,
  PokemonSchema,
} from './schemas/pokemons.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pokemon.name, schema: PokemonSchema },
      { name: Attack.name, schema: AttackSchema },
    ]),
  ],
  controllers: [PokemonsController],
  providers: [PokemonsService],
  exports: [PokemonsService, MongooseModule],
})
export class PokemonsModule {}
