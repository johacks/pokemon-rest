import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { CreateUserDto } from 'src/users/dto/users.dto';
import { User } from 'src/users/schemas/users.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/')
  async create(@Body() createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto);
  }

  @Get('/')
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
}