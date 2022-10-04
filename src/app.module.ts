import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfigManager } from 'src/database/ormconfig';
import { PokemonsModule } from './pokemons/pokemons.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleOauthModule } from 'src/auth/google-oauth/google-oauth.module';
import { JwtAuthModule } from 'src/auth/jwt-auth/jwt-auth.module';
import { PassportModule } from '@nestjs/passport';
import { LocalModule } from 'src/auth/local/local.module';

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
    JwtAuthModule,
    GoogleOauthModule,
    LocalModule,
    PokemonsModule,
    UsersModule,
    PassportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
