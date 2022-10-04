import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './services/users.service';
import { User, UsersSchema } from './schemas/users.schema';
import { FavoritesController } from './controllers/favorites.controller';
import { PokemonsModule } from 'src/pokemons/pokemons.module';
import { FavoritesService } from './services/favorites.service';

@Module({
  imports: [
    PokemonsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
  ],
  controllers: [FavoritesController],
  providers: [UsersService, FavoritesService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
