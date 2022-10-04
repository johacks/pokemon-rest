import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: JwtService) {}

  async login(user) {
    return {
      accessToken: await this.jwtService.signAsync({
        username: user.visibleUsername,
        sub: user.userId,
      }),
    };
  }
}
