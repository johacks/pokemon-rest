import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Pokemon } from '../../pokemons/schemas/pokemons.schema';

export type UserDocument = User &
  Document & { _id: mongoose.Schema.Types.ObjectId };

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Pokemon' })
  favoritePokemons: Pokemon[];
}

export const UsersSchema = SchemaFactory.createForClass(User);
