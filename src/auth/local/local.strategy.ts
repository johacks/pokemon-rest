import { Strategy, VerifyCallback } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LocalService } from './local.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: LocalService) {
    super({ usernameField: 'userId', passwordField: 'pass' });
  }

  async validate(
    username: string,
    password: string,
    done: VerifyCallback,
  ): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) throw new UnauthorizedException();
    done(null, {
      userId: user.userId,
      visibleUsername: user.visibleUsername
    });
    return user;
  }
}
