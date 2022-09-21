import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './controller/users/users.controller';
import { UsersService } from './service/users/users.service';
import { User, UsersSchema } from './schemas/users/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
