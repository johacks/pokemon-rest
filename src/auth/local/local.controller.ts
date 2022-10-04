import {
  Body,
  ConflictException,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthService } from 'src/auth/jwt-auth/jwt-auth.service';
import { IGetUserAuthInfoRequest } from 'src/utils/request';
import { LocalGuard } from 'src/auth/local/local.guard';
import { RegisterInfo } from 'src/auth/local/local.dto';
import {
  UsersService,
  UsersServiceErrors,
} from 'src/users/services/users.service';
import { ApiTags } from '@nestjs/swagger';

export const USERNAME_COLLISION_ERR =
  'There is already a user with this username';

@ApiTags('auth')
@Controller('auth')
export class LocalController {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login(
    @Req() req: IGetUserAuthInfoRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.jwtAuthService.login({
      visibleUsername: req.user.visibleUsername,
      userId: req.user.userId,
    });
    res.cookie('jwt', accessToken);
    return { accessToken };
  }

  @Post('register')
  async register(
    @Body() registerInfo: RegisterInfo,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { value: user, errors } = await this.usersService.create(
      registerInfo.userId,
      registerInfo.pass,
      true,
    );
    if (errors === UsersServiceErrors.USER_EXISTS)
      throw new ConflictException(USERNAME_COLLISION_ERR);
    const { accessToken } = await this.jwtAuthService.login({
      visibleUsername: user.visibleUsername,
      userId: user.userId,
    });
    res.cookie('jwt', accessToken);
    return { accessToken };
  }
}
