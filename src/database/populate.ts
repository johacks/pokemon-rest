import { Db, MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { DatabaseConfigManager } from 'src/database/ormconfig';
import * as mongoose from 'mongoose';
import pokemons from 'data/pokemons.json';
import { exit } from '@nestjs/cli/actions';
import { sha256b64 } from 'src/utils/crypto';

export class DatabasePopulator {
  private db: Db;
  constructor(private conn: MongoClient, private cryptoSecret: string) {
    this.db = conn.db();
  }

  async clean() {
    // Drop collections that exist
    // https://stackoverflow.com/questions/37136204/mongoerror-ns-not-found-when-try-to-drop-collection
    const collections = (await this.db.listCollections().toArray()).map(
      (collection) => collection.name,
    );
    for (let i = 0; i < collections.length; i++) {
      await this.db.dropCollection(collections[i]);
    }
  }

  async cleanPopulate() {
    await this.clean();
    await this.db.collection('attacks').findOne();
    await this.db.collection('users').findOne();
    await this.db.collection('pokemons').findOne();

    const pokemonsColl = this.db.collection('pokemons');
    const attacksColl = this.db.collection('attacks');

    await pokemonsColl.insertMany(pokemons);

    // Change to a more usable naming convention
    await pokemonsColl.updateMany(
      {},
      {
        $rename: {
          'Previous evolution(s)': 'previousEvolutions',
          id: 'pokemonId', // Bad name for public id, has some collisions
        },
      },
      { upsert: false },
    );

    // Rename also id to pokemonId in previousEvolutions and evolutions
    await pokemonsColl.updateMany(
      {},
      [
        {
          $set: {
            previousEvolutions: {
              $map: {
                input: '$previousEvolutions',
                in: {
                  $mergeObjects: ['$$this', { pokemonId: '$$this.id' }],
                },
              },
            },
            evolutions: {
              $map: {
                input: '$evolutions',
                in: {
                  $mergeObjects: ['$$this', { pokemonId: '$$this.id' }],
                },
              },
            },
          },
        },
        { $unset: ['previousEvolutions.id', 'evolutions.id'] },
      ],
      { upsert: false },
    );

    // Treat pokemonIds as integers for consistency on other references
    // (e.g. evolutions). Client can reformat with leading zeros.
    await pokemonsColl.updateMany({}, [
      { $set: { pokemonId: { $toInt: '$pokemonId' } } },
    ]);

    // It is better to handle information explicitly on the backend, the client can
    // display it later more verbosely. Therefore, the common capture area is
    // summed up in a single field. The same applies to the pokemon class
    const regions = [
      'Australia, New Zealand',
      'North America',
      'Western Europe',
      'Asia',
    ];

    // The for loops are embarrassing, but they don't do harm in a db this small
    // and this being a script not to be frequently executed
    for (const verboseRegion of regions) {
      await pokemonsColl.updateMany(
        {
          'Common Capture Area': `Early reports that this Pokémon is likely to be found in: ${verboseRegion}`,
        },
        [
          {
            $set: { commonCaptureArea: `${verboseRegion}` },
          },
          {
            $unset: ['Common Capture Area', `${verboseRegion}`],
          },
        ],
      );
    }

    const pokemonClasses = ['LEGENDARY', 'MYTHIC'];

    for (const pokemonClass of pokemonClasses) {
      await pokemonsColl.updateMany(
        {
          'Pokémon Class': `This is a ${pokemonClass} Pokémon.`,
        },
        [
          {
            $set: { pokemonClass: `${pokemonClass}` },
          },
          {
            $unset: ['Pokémon Class', `${pokemonClass}`],
          },
        ],
      );
    }

    // Move attacks to a separate collection. The goal is consistency in changes
    // to attack properties across all pokemon with that attack. Also helps
    // with possible future attack endpoints
    await pokemonsColl
      .aggregate([
        // Get all attacks in a single field
        {
          $set: {
            attack: { $concatArrays: ['$attacks.fast', '$attacks.special'] },
          },
        },
        // Get all attacks as an array
        {
          $unwind: '$attack',
        },
        {
          $replaceWith: '$attack',
        },
        // Remove duplicates
        {
          $group: {
            _id: '$name',
            name: { $first: '$name' },
            type: { $first: '$type' },
            damage: { $first: '$damage' },
          },
        },
        // Reset id
        {
          $project: { _id: 0 },
        },
        {
          $out: attacksColl.collectionName,
        },
      ])
      .toArray(); // Seems necessary to execute the query

    // Make attacks a reference to object in corresponding attack collection
    await pokemonsColl
      .aggregate([
        {
          $lookup: {
            from: 'attacks',
            localField: 'attacks.fast.name',
            foreignField: 'name',
            as: 'fastAttackInfo',
          },
        },
        {
          $lookup: {
            from: 'attacks',
            localField: 'attacks.special.name',
            foreignField: 'name',
            as: 'specialAttackInfo',
          },
        },
        {
          $set: {
            'attacks.fast': '$fastAttackInfo._id',
            'attacks.special': '$specialAttackInfo._id',
          },
        },
        {
          $unset: ['specialAttackInfo', 'fastAttackInfo'],
        },
        {
          $out: pokemonsColl.collectionName,
        },
      ])
      .toArray();

    // Make evolutions a reference to an existing pokemon, helps mantain consistency
    await pokemonsColl
      .aggregate([
        {
          $lookup: {
            from: 'pokemons',
            localField: 'previousEvolutions.name',
            foreignField: 'name',
            as: 'prevPokemonInfo',
          },
        },
        {
          $lookup: {
            from: 'pokemons',
            localField: 'evolutions.name',
            foreignField: 'name',
            as: 'nextPokemonInfo',
          },
        },
        {
          $set: {
            previousEvolutions: '$prevPokemonInfo._id',
            evolutions: '$nextPokemonInfo._id',
          },
        },
        {
          $unset: ['prevPokemonInfo', 'nextPokemonInfo'],
        },
        {
          $out: pokemonsColl.collectionName,
        },
      ])
      .toArray();

    // Create sample username
    await this.db.collection('users').insertOne({
      userId: 'testUser',
      visibleUsername: 'testUser',
      pass: sha256b64('changeme' + this.cryptoSecret),
      local: true,
    });

    // Create indexes
    await pokemonsColl.createIndexes([
      { key: { pokemonId: 1 } },
      { key: { name: 1 } },
    ]);
  }
}

/* istanbul ignore next */
async function main() {
  // Load env variables to process.env
  dotenv.config({ path: 'private.env' });
  dotenv.config({ path: '.env' });
  const { uri, ...connOptions } = new DatabaseConfigManager(
    undefined,
  ).getConnectionParameters();
  const connection = await mongoose.connect(uri, connOptions);
  const dbPop = new DatabasePopulator(
    connection.connection.getClient(),
    process.env.CRYPTO_SECRET,
  );
  await dbPop.cleanPopulate();
  console.log('Finished database population');
  exit();
}

/* istanbul ignore next */
if (require.main === module) {
  main();
}
