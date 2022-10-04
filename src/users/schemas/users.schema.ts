import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemons/schemas/pokemons.schema';

export type UserDocument = User &
  Document & { _id: mongoose.Schema.Types.ObjectId };

@Schema()
export class User {
  @Prop({ required: true, unique: true, dropDups: true })
  userId: string;

  @Prop()
  pass?: string;

  @Prop()
  visibleUsername?: string;

  @Prop({ required: true })
  local: boolean;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Pokemon', default: [] })
  favoritePokemons?: Pokemon[];
}

export const UsersSchema = SchemaFactory.createForClass(User);
