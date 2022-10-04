import { Module } from '@nestjs/common';
import { GoogleOauthController } from 'src/auth/google-oauth/google-oauth.controller';
import { GoogleOauthStrategy } from 'src/auth/google-oauth/google-oauth.strategy';
import { JwtAuthModule } from 'src/auth/jwt-auth/jwt-auth.module';
import { UsersService } from 'src/users/services/users.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [JwtAuthModule, UsersModule, PassportModule],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthStrategy, UsersService],
})
export class GoogleOauthModule {}
