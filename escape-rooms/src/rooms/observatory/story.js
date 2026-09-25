// All in-world writing for the observatory. Personal touches go here later.

export const LETTER = {
  heading: 'Kestrel Point Observatory — the night of the 14th',
  greeting: 'My dear friends,',
  body: [
    'Forgive me for not meeting you at the door. By the time you read this I shall be away — do not worry, I am quite safe — but I could not bear to leave without a little game.',
    'Tonight I found something in the sky that no one has ever seen. I want you two to be the first to see it, but I will not simply hand it to you. What fun would that be?',
    'You will have noticed the door has locked behind you. I am afraid that is my doing. It is geared to the great telescope, and it will open only when the telescope is turned upon my discovery.',
    'Everything you need is in this room. Begin where I always begin — at my desk. I set its lock to the moment time stood still.',
  ],
  signoff: 'With great affection,',
  signature: 'Elara Voss',
};

export const JOURNAL = [
  {
    date: '3rd October',
    text: [
      'The new refractor is mounted at last. Twelve feet of brass and glass, and every inch of it worth the Society’s grumbling about the cost.',
      'Kestrel Point has the darkest skies in the county. I intend to use every one of them.',
    ],
  },
  {
    date: '9th October',
    text: [
      'Mother’s clock stopped again tonight, at the very moment I first glimpsed the faint new light beside the Lyre. I shall not wind it. Let it keep that minute for me.',
    ],
  },
  {
    date: '11th October',
    text: [
      'Rivals everywhere. From now on every telegram to the Society goes out enciphered.',
      'The wheel’s setting is the letter that greets me each time I come home — I had it hung above my own door, so I could never forget it.',
    ],
  },
  {
    date: '12th October',
    text: [
      'I have set the orrery to the night of the discovery, and hidden something precious in its base. The base opens only when the planets stand as they stood that night.',
      'I have drawn their positions on the next page, should anyone meddle with it.',
    ],
  },
  {
    torn: true,
    text: ['The next page has been torn out. Only a ragged strip remains along the spine.'],
  },
  {
    date: '13th October',
    text: [
      'The Society’s man called today, far too interested in this journal. I have torn out the orrery page and torn it again in two.',
      'One half is where I keep my spare eyes. The other I slipped between the pages of my own book — let him try reading that.',
    ],
  },
  {
    date: '14th October',
    text: [
      'It is there. I am certain now. A new star, faint and blue-white, beside the Lyre.',
      'I shall not write its position plainly. The HOUR went to the Society by telegram this evening. The HEIGHT is written in the sky itself — look for the Lyre on my chart. The lens that sees it I have locked in the orrery.',
      'Put them together, and look.',
    ],
  },
];

// One-line musings for things that are only atmosphere. Shown as a passing subtitle,
// never a modal, so players can tell at a glance they aren't part of a puzzle.
export const FLAVOR = {
  coatStand: 'Voss’s heavy travelling cloak. It smells of sea air and pipe smoke.',
  mapChest: 'Shallow drawers of old coastline charts, spotted with damp. Nothing of the sky in here.',
  winch: 'The winch for the dome shutters. The slit is already open as wide as it will go.',
  ladder: 'A ladder up to the dome rail, for greasing the wheels. The rungs are slick with it.',
  stove: 'A pot-bellied stove, still warm. Someone fed it not long before you arrived.',
  armchair: 'A deep leather armchair, worn to the shape of its owner.',
  teacup: 'Tea, stone cold. Whoever poured it forgot it entirely.',
  globe: 'A terrestrial globe. Someone has pencilled a small circle around this stretch of coast.',
  trunk: 'A steamer trunk plastered with shipping labels. Eclipse expeditions, by the look of it.',
  portrait: 'A stern woman with a small brass telescope. The resemblance to Voss is unmistakable.',
  moon: 'An engraving of the Moon, drawn at the eyepiece. Every crater is labelled in tiny script.',
  saturn: 'Saturn and its rings, engraved with loving care.',
  fern: 'A fern, the only living thing up here besides you two. It could use some water.',
  barometer: 'The barometer needle leans towards CHANGE.',
  cabinet: 'Sextants, a spyglass, an astrolabe. Lovely things, but none of them fit the great telescope.',
  observingChair: 'An observing chair, its seat wound up to the height of the eyepiece.',
  telegraph: 'A telegraph key. The line is dead; the battery has been disconnected.',
  crate: 'The packing crate the new telescope came in. Empty now, but for straw.',
  deskChair: 'Voss’s desk chair, pushed back as if she left in a hurry.',
};

// The bookshelf. Voss's own book hides half of the torn page.
export const BOOKS = [
  ['Celestial Objects for Common Telescopes', 'Webb', 'Every margin is full of her pencilled notes.'],
  ['The Story of the Heavens', 'Ball', 'A pressed violet marks the chapter on comets.'],
  ['Outlines of Astronomy', 'Herschel', 'The spine cracks as you open it. Nothing inside.'],
  ['Popular Astronomy', 'Newcomb', 'A well-read copy. Nothing tucked between the pages.'],
  ['The Planet Mars', 'Flammarion', 'In French. Someone has underlined every mention of canals, with a question mark.'],
  ['Other Worlds than Ours', 'Proctor', 'Just the book.'],
  ['The Moon', 'Nasmyth', 'Beautiful plates of plaster lunar models. Nothing else.'],
  ['Cosmos', 'Humboldt', 'Heavy enough to stop a door. Nothing hidden in it.'],
  ['Comets and Meteors', 'Kirkwood', 'A dried leaf falls out. Only a leaf.'],
  ['Nautical Almanac', 'Admiralty', 'Columns of tables, thumbed soft.'],
  ['A Cycle of Celestial Objects', 'Smyth', 'Just the book.'],
  ['The Spectroscope', 'Lockyer', 'The diagrams have been coloured in by hand.'],
  ['Half-Hours with the Telescope', 'Proctor', 'A child’s copy, her name inside in careful capitals.'],
  ['Faint Lights: Notes on Variable Stars', 'E. Voss', null],
  ['The Heavens', 'Guillemin', 'The engravings are lovely. Nothing between them.'],
  ['System of the World', 'Laplace', 'In French again. Untouched.'],
  ['Handbook of Descriptive Astronomy', 'Chambers', 'Nothing tucked inside.'],
  ['Sidereus Nuncius', 'Galileo', 'A slim facsimile, handled with care.'],
  ['Lectures on Light', 'Tyndall', 'Just the book.'],
  ['An Easy Guide to the Constellations', 'Gall', 'Written for beginners. Well loved all the same.'],
  ['Monthly Notices', 'R.A.S.', 'A bound run of the Society’s journal. Her name appears in the index.'],
  ['The Sun', 'Young', 'Just the book.'],
  ['Uranometria', 'Bayer', 'An old star atlas, too fragile to leaf through.'],
  ['Double Stars', 'Crossley', 'Nothing tucked inside.'],
  ['Essays on Astronomy', 'Proctor', 'Proctor again. She must have liked him.'],
  ['Principia', 'Newton', 'In Latin. The ribbon has never been moved.'],
  ['Recreations in Astronomy', 'Warren', 'Just the book.'],
];

// The enciphered telegram to the Society. CIPHER is PLAIN run through the wheel.
export const TELEGRAM = {
  handedIn: 'Kestrel Point',
  to: 'The Secretary, Royal Astronomical Society, Burlington House, London',
  plain: 'THE HOUR IS NINETEEN',
  cipher: 'YMJ MTZW NX SNSJYJJS',
  from: 'VOSS',
};

// Pinned to the inside of the door, found once it swings open.
export const FINAL_LETTER = {
  heading: 'Kestrel Point — the small hours',
  greeting: 'My dear friends,',
  body: [
    'If you are reading this, then you have seen it: a new light beside the Lyre, blue-white and steady, where no star has ever been written down.',
    'Tomorrow the Society will have its telegram and its figures, and learned men will argue over what to call it. Let them. You two were the first to see it after me, and that is a thing no one can take from you.',
    'The stairs are steep and the lantern is lit. There is a kettle on at the bottom, and I shall be waiting beside it, wanting to hear every clever thing you did.',
  ],
  signoff: 'Ever yours,',
  signature: 'Elara',
};
