import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonsController } from './controllers/pokemons/pokemons.controller';
import { PokemonsService } from './services/pokemons/pokemons.service';
import { Pokemon, PokemonsSchema } from './schemas/pokemons/pokemons.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pokemon.name, schema: PokemonsSchema }]),
  ],
  controllers: [PokemonsController],
  providers: [PokemonsService],
})
export class PokemonsModule {}
