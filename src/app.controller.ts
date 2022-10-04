import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiExcludeEndpoint()
  @Get()
  redirect(@Res() res) {
    return res.redirect('/api');
  }

  @ApiExcludeEndpoint()
  @Get('/api/redoc')
  redocApi(@Res() res) {
    res.sendfile(join(__dirname, '..', '..', 'public', 'redoc.html'));
  }
}
