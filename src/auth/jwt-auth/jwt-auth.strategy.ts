import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';

export type JwtPayload = { sub: number; username: string };

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const extractJwtFromCookies = (req) => req?.cookies?.jwt;
    super(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          ExtractJwt.fromAuthHeaderWithScheme('JWT'),
          ExtractJwt.fromAuthHeaderAsBearerToken(),
          extractJwtFromCookies,
        ]),
        ignoreExpiration: false,
        secretOrKey: configService.get<string>('JWT_SECRET'),
      },
      (jwtPayload, done) => {
        done(null, {
          visibleUsername: jwtPayload.username,
          userId: jwtPayload.sub,
        });
      },
    );
  }

  async validate(payload: JwtPayload) {
    return { id: payload.sub, username: payload.username };
  }
}
