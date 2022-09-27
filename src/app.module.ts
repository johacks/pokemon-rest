import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ormConf } from './ormconfig';
import { PokemonsModule } from './pokemons/pokemons.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://pokemon-db.5r0lxid.mongodb.net/pokemon-db',
      ormConf,
    ),
    PokemonsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
