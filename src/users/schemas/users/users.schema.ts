import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({ required: true })
  username: string;
}

export const UsersSchema = SchemaFactory.createForClass(User);
