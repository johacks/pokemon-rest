import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { ConfigService } from '@nestjs/config';
import { sha256b64 } from 'src/utils/crypto';

@Injectable()
export class LocalService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async validateUser(userId: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(userId, true);
    if (
      user &&
      user.pass &&
      user.pass ===
        sha256b64(pass + this.configService.get<string>('CRYPTO_SECRET'))
    ) {
      user.pass = undefined;
      return user;
    }
    return null;
  }
}
