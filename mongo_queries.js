// Change to a more usable naming convention
db.pokemons.updateMany(
  {},
  {
    $rename: {
      'Previous evolution(s)': 'previousEvolutions',
      id: 'pokemonId', // Bad name for public id, has some collisions
    },
  },
  false,
  true,
);

// Rename also id to pokemonId in previousEvolutions and evolutions
db.pokemons.updateMany({}, [
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
    },
  },
  { $unset: 'previousEvolutions.id' },
]);

db.pokemons.updateMany({}, [
  {
    $set: {
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
  { $unset: 'evolutions.id' },
]);

// Treat pokemonIds as integers for consistency on other references
// (e.g. evolutions). Client can reformat with leading zeros.
db.pokemons.updateMany({}, [{ $set: { pokemonId: { $toInt: '$pokemonId' } } }]);

// It is better to handle information explicitly on the backend, the client can
// display it later more verbosely. Therefore, the common capture area is
// summed up in a single field. The same applies to the pokemon class
let regions = [
  'Australia, New Zealand',
  'North America',
  'Western Europe',
  'Asia',
];

// The for loops are embarrassing, but they don't do harm in a db this small
// and this being a script not to be frequently executed
for (const verboseRegion of regions) {
  db.pokemons.updateMany(
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

let pokemonClasses = ['LEGENDARY', 'MYTHIC'];

for (const pokemonClass of pokemonClasses) {
  db.pokemons.updateMany(
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
db.pokemons.aggregate([
  // Get all attacks in a single field
  {
    $set: { attack: { $concatArrays: ['$attacks.fast', '$attacks.special'] } },
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
]);

// Make attacks a reference to object in attack collection
db.pokemons.aggregate([
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
    $out: { db: 'pokemon-db', coll: 'pokemons' },
  },
]);

// Make evolutions a reference to an existing pokemon, helps mantain consistency
db.pokemons.aggregate([
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
    $out: { db: 'pokemon-db', coll: 'pokemons' },
  },
]);
