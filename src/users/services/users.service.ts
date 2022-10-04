import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  UsersSchema,
} from 'src/users/schemas/users.schema';
import { Maybe } from 'src/utils/errors';
import { sha256b64 } from 'src/utils/crypto';
import { ConfigService } from '@nestjs/config';

export enum UsersServiceErrors {
  USER_EXISTS,
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async getOrCreateUser(user: User): Promise<UserDocument> {
    return this.userModel
      .findOneAndUpdate({ userId: user.userId, local: user.local }, user, {
        upsert: true,
      })
      .exec();
  }

  async findOne(userId, local: true): Promise<UserDocument> {
    return this.userModel.findOne({ userId: userId, local: local }).exec();
  }

  async create(
    userId: string,
    pass: string,
    local: true,
    visibleUsername?: string,
  ): Promise<Maybe<UserDocument, UsersServiceErrors>> {
    const User = this.userModel.db.model('User', UsersSchema);
    const user = new User();
    user.userId = userId;
    user.local = local;
    user.pass = sha256b64(
      pass + this.configService.get<string>('CRYPTO_SECRET'),
    );
    user.visibleUsername = visibleUsername ?? userId;
    // Validate created user
    try {
      await user.save();
    } catch (e) {
      if (e.code === 11000) return { errors: UsersServiceErrors.USER_EXISTS };
    }
    return { value: user as UserDocument };
  }
}
