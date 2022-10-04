import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { GoogleOauthGuard } from 'src/auth/google-oauth/google-oauth.guard';
import { JwtAuthService } from 'src/auth/jwt-auth/jwt-auth.service';
import { IGetUserAuthInfoRequest } from 'src/utils/request';

@Controller('auth/google')
export class GoogleOauthController {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  @Get()
  @UseGuards(GoogleOauthGuard)
  async googleAuth(@Req() req) {
    // Redirected with guard
  }

  @Get('redirect')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(
    @Req() req: IGetUserAuthInfoRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.jwtAuthService.login(req.user);
    res.cookie('jwt', accessToken);
    return { accessToken };
  }
}
