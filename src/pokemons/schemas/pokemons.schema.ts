import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';

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
class EvolutionRequirements {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  name: string;
}
const EvolutionRequirementsDescriptor = {
  amount: { amount: Number },
  name: { type: String },
};

class MinMax {
  @ApiProperty()
  minimum: string;

  @ApiProperty()
  maximum: string;
}

// Attacks have their own collection
@Schema()
export class Attack {
  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty({ enum: PokemonType })
  @Prop({ type: String, enum: PokemonType, required: true })
  type: PokemonType;

  @ApiProperty()
  @Prop({ required: true })
  damage: number;
}

export class Attacks {
  @ApiProperty({ type: Attack, isArray: true })
  fast: Attack[];

  @ApiProperty({ type: Attack, isArray: true })
  special: Attack[];
}
const AttacksDescriptor = {
  fast: { type: [mongoose.Schema.Types.ObjectId], ref: 'Attack' },
  special: { type: [mongoose.Schema.Types.ObjectId], ref: 'Attack' },
};

@Schema()
export class Pokemon {
  @ApiProperty({ example: 1 })
  @Prop({ required: true })
  pokemonId: number;

  @ApiProperty({ example: 'Bulbasaur' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ example: 'Seed Pokémon' })
  @Prop({ required: true })
  classification: string;

  @ApiProperty({ example: 951 })
  @Prop({ required: true })
  maxCP: number;

  @ApiProperty({ example: 1051 })
  @Prop({ required: true })
  maxHP: number;

  @ApiProperty({ example: 0.1 })
  @Prop({ required: true })
  fleeRate: number;

  @ApiPropertyOptional({ enum: Region })
  @Prop()
  commonCaptureArea?: Region;

  @ApiPropertyOptional({ enum: PokemonClass })
  @Prop()
  pokemonClass?: PokemonClass;

  @ApiProperty({ enum: PokemonType, isArray: true })
  @Prop({ type: [String], enum: PokemonTypes, required: true })
  types: PokemonType[];

  @ApiProperty({ enum: PokemonType, isArray: true })
  @Prop({ type: [String], enum: PokemonTypes, required: true })
  resistant: PokemonType[];

  @ApiProperty({ enum: PokemonType, isArray: true })
  @Prop({ type: [String], enum: PokemonTypes, required: true })
  weaknesses: PokemonType[];

  @ApiProperty({ type: MinMax })
  @Prop({
    type: { minimum: { type: String }, maximum: { type: String } },
    required: true,
  })
  weight: MinMax;

  @ApiProperty({ type: MinMax })
  @Prop({
    type: { minimum: { type: String }, maximum: { type: String } },
    required: true,
  })
  height: MinMax;

  @ApiProperty({ type: () => Evolutions })
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Pokemon' })
  previousEvolutions: Evolutions[];

  @ApiProperty({ type: () => Evolutions })
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Pokemon' })
  evolutions: Evolutions[];

  @ApiProperty({ type: EvolutionRequirements })
  @Prop({ type: EvolutionRequirementsDescriptor })
  evolutionRequirements?: EvolutionRequirements;

  @ApiProperty({})
  @Prop({ type: AttacksDescriptor, required: true })
  attacks: Attacks;
}

class Evolutions extends PickType(Pokemon, ['name', 'pokemonId']) {}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
export const AttackSchema = SchemaFactory.createForClass(Attack);
