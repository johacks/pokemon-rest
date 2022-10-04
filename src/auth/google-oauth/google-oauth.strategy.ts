import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/services/users.service';
import { sha256b64 } from 'src/utils/crypto';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_SECRET'),
      callbackURL: 'http://localhost:3000/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails, id, name } = profile;
    const user = {
      provider: 'google',
      userId: sha256b64(
        id + emails[0].value + this.configService.get<string>('CRYPTO_SECRET'),
      ),
      visibleUsername: name.givenName,
      accessToken,
    };
    await this.usersService.getOrCreateUser({
      userId: user.userId,
      local: false,
      visibleUsername: user.visibleUsername,
    });
    done(null, user);
  }
}
