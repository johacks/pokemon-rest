import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PokemonDocument = Pokemon & Document;

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
export const PokemonTypes = Object.values(PokemonType)

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

// Brief information of some Pokemon
export type PokemonBrief = { pokemonId: number; name: string };
const PokemonBriefSchema = {
  pokemonId: { type: Number },
  name: { type: String },
};

// Evolution requirement of Pokemon
export type EvolutionRequirements = { amount: number; name: string };
const EvolutionRequirementsSchema = {
  amount: { amount: Number },
  name: { type: String },
};

// Pokemon attacks
export type Attack = {
  name: string;
  type: PokemonType;
  damage: number;
};
const AttackSchema = {
  name: { type: String },
  type: { type: String },
  damage: { type: Number },
};

export type Attacks = {
  fast: Attack[];
  special: Attack[];
};

const AttacksSchema = {
  fast: { type: [AttackSchema] },
  special: { type: [AttackSchema] },
};

// Some validations are set, although not necessary yet, as pokemon are read-only
// They are set eitherway to be consistent with the database
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

  @Prop({ type: [PokemonBriefSchema] })
  previousEvolutions: PokemonBrief[];

  @Prop({ type: [PokemonBriefSchema] })
  evolutions: PokemonBrief[];

  @Prop({ type: EvolutionRequirementsSchema })
  evolutionRequirements: EvolutionRequirements;

  @Prop({ required: true })
  maxCP: number;

  @Prop({ required: true })
  maxHP: number;

  @Prop({ type: AttacksSchema, required: true })
  attacks: Attacks;

  @Prop()
  commonCaptureArea: Region;

  @Prop()
  pokemonClass: PokemonClass;
}

export const PokemonsSchema = SchemaFactory.createForClass(Pokemon);
