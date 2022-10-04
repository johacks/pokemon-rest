import { Module } from '@nestjs/common';
import { JwtAuthModule } from 'src/auth/jwt-auth/jwt-auth.module';
import { UsersService } from 'src/users/services/users.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalController } from 'src/auth/local/local.controller';
import { LocalStrategy } from 'src/auth/local/local.strategy';
import { LocalService } from 'src/auth/local/local.service';

@Module({
  imports: [JwtAuthModule, UsersModule, PassportModule],
  controllers: [LocalController],
  providers: [LocalStrategy, UsersService, LocalService],
})
export class LocalModule {}
