import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Pokemon } from '../../pokemons/schemas/pokemons.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({ required: true })
  username: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Pokemon' })
  favoritePokemons: Pokemon[];
}

export const UsersSchema = SchemaFactory.createForClass(User);
