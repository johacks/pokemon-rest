import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type PokemonDocument = Pokemon &
  Document & { _id: mongoose.Schema.Types.ObjectId };

export enum PokemonType {
  BUG = 'Bug',
  DARK = 'Dark',
  DRAGON = 'Dragon',
  ELECTRIC = 'Electric',
  FAIRY = 'Fairy',
  FIGHTING = 'Fighting',
  FIRE = 'Fire',
  FLYING = 'Flying',
  GHOST = 'Ghost',
  GRASS = 'Grass',
  GROUND = 'Ground',
  ICE = 'Ice',
  NORMAL = 'Normal',
  POISON = 'Poison',
  PSYCHIC = 'Psychic',
  ROCK = 'Rock',
  STEEL = 'Steel',
  WATER = 'Water',
}
export const PokemonTypes = Object.values(PokemonType);

export enum Region {
  ANZ = 'Australia, New Zealand',
  NAM = 'North America',
  WEU = 'Western Europe',
  AS = 'Asia',
}

export enum PokemonClass {
  MYTHIC = 'MYTHIC',
  LEGENDARY = 'LEGENDARY',
}

// Evolution requirement of Pokemon
export type EvolutionRequirements = { amount: number; name: string };
const EvolutionRequirementsDescriptor = {
  amount: { amount: Number },
  name: { type: String },
};

// Attacks have their own collection
@Schema()
export class Attack {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: PokemonType, required: true })
  type: PokemonType;

  @Prop({ required: true })
  damage: number;
}

export type Attacks = { fast: Attack[]; special: Attack[] };
const AttacksDescriptor = {
  fast: { type: [mongoose.Schema.Types.ObjectId], ref: 'Attack' },
  special: { type: [mongoose.Schema.Types.ObjectId], ref: 'Attack' },
};

@Schema()
export class Pokemon {
  @Prop({ required: true })
  pokemonId: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  classification: string;

  @Prop({ type: [String], enum: PokemonTypes, required: true })
  types: PokemonType[];

  @Prop({ type: [String], enum: PokemonTypes, required: true })
  resistant: PokemonType[];

  @Prop({ type: [String], enum: PokemonTypes, required: true })
  weaknesses: PokemonType[];

  @Prop({
    type: { minimum: { type: String }, maximum: { type: String } },
    required: true,
  })
  weight: { minimum: string; maximum: string };

  @Prop({
    type: { minimum: { type: String }, maximum: { type: String } },
    required: true,
  })
  height: { minimum: string; maximum: string };

  @Prop({ required: true })
  fleeRate: number;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Pokemon' })
  previousEvolutions: { name: string; pokemonId: number }[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Pokemon' })
  evolutions: { name: string; pokemonId: number }[];

  @Prop({ type: EvolutionRequirementsDescriptor })
  evolutionRequirements: EvolutionRequirements;

  @Prop({ required: true })
  maxCP: number;

  @Prop({ required: true })
  maxHP: number;

  @Prop({ type: AttacksDescriptor, required: true })
  attacks: Attacks;

  @Prop()
  commonCaptureArea: Region;

  @Prop()
  pokemonClass: PokemonClass;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
export const AttackSchema = SchemaFactory.createForClass(Attack);
