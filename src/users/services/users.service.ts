import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // Mock authentication that simply ensures a user exists and returns it
  // Probable implementation returns at least user id via a JWT authentication
  async authenticate() {
    return this.userModel.findOneAndUpdate(
      { email: 'mockuser@mail.com' },
      { email: 'mockuser@mail.com' },
      { new: true, upsert: true },
    );
  }
}
