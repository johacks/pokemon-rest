import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfigManager } from 'src/database/ormconfig';
import { PokemonsModule } from './pokemons/pokemons.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['private.env', '.env'],
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) =>
        new DatabaseConfigManager(configService).getConnectionParameters(),
      inject: [ConfigService],
    }),
    PokemonsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
