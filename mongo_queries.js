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
