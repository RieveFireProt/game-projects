// All in-world writing for the observatory. Personal touches go here later.
// SPOILERS: every clue in the room is written here.

export const LETTER = {
  heading: 'Kestrel Point Observatory — the night of the 14th',
  greeting: 'My dear friends,',
  body: [
    'Forgive me for not meeting you at the door. By the time you read this I shall be away — do not worry, I am quite safe — but I could not bear to leave without a little game.',
    'Tonight I found something in the sky that no one has ever seen. I want you two to be the first to see it, but I will not simply hand it to you. What fun would that be?',
    'You will have noticed the door has locked behind you. I am afraid that is my doing. It is geared to the great telescope, and it will open only when the telescope is turned upon my discovery.',
    'Everything you need is in this room, though I have been careless with my papers, and you will want to read every scrap. Begin where I always begin — at my desk. I set its lock to the moment time stood still.',
  ],
  signoff: 'With great affection,',
  signature: 'Elara Voss',
};

export const JOURNAL = [
  {
    date: '3rd October',
    text: [
      'The new refractor is mounted at last. Twelve feet of brass and glass, and every inch of it worth the Society’s grumbling about the cost.',
      'Old Webb had it right in his “Celestial Objects for Common Telescopes”: the observer’s first instrument is not the telescope at all, but patience. Kestrel Point has the darkest skies in the county. I intend to be very patient.',
    ],
  },
  {
    date: '5th October',
    text: [
      'Whoever built this tower had something to hide. There is a priest-hole in the wall beside the bookcase, and the old latch still works: tip forward one book on each shelf — the right four — and the stone swings open.',
      'I have reset it to the four books I quote most. Anyone who reads my scribbles will know which they are; I cannot write a note without borrowing somebody’s words.',
    ],
  },
  {
    date: '9th October',
    text: [
      'Mother’s clock stopped again tonight, at the very moment I first glimpsed the faint new light beside the Lyre. I shall not wind it. Let it keep that minute for me.',
    ],
  },
  {
    date: '10th October',
    text: [
      'The Society’s man was here again, fingering my sextants. The cabinet key now lives up among the wheels of the dome, where no gentleman in a good coat will ever follow it.',
    ],
  },
  {
    date: '11th October',
    text: [
      'Rivals everywhere. From now on every message to the Society goes out enciphered, and the register beside the key keeps a copy on its tape. My code card stays in this drawer.',
      'The cipher wheel is packed in my old eclipse trunk. Its lock remembers the places where the Moon’s shadow found me, in the order it found me.',
      'The wheel’s setting is the letter that greets me each time I come home — I had it hung above my own door, so I could never forget it.',
    ],
  },
  {
    date: '12th October',
    text: [
      'I have set the orrery to the night of the discovery, and hidden something precious in its base. The base opens only when all six planets stand as they stood that night.',
      'I have drawn the four nearest on the next page. Jupiter and Saturn crawl so slowly that I did not trouble to draw them; the Almanac has their places, and the Almanac is locked away with my charts.',
      'Saturn has rolled off his arm again, and gone to ground among the fronds. Let him sulk there for now.',
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
      'I shall not write its position plainly. The HOUR went to the Society by wire this evening. The lens that sees her I have locked in the orrery.',
      'The HEIGHT I took from three sightings, each along a line from one old friend on my chart to another. Where the three lines cross, there she is. One sighting is behind the stone, one lies under my own red ink, and one is with my charts.',
      'Put them together, and look.',
    ],
  },
];

// One-line musings for things that are only atmosphere. Shown as a passing subtitle,
// never a modal, so players can tell at a glance they aren't part of a puzzle.
export const FLAVOR = {
  winch: 'The winch for the dome shutters. The slit is already open as wide as it will go.',
  stove: 'A pot-bellied stove, still warm. Someone fed it not long before you arrived.',
  armchair: 'A deep leather armchair, worn to the shape of its owner.',
  globe: 'A terrestrial globe. Someone has pencilled a small circle around this stretch of coast.',
  moon: 'An engraving of the Moon, drawn at the eyepiece. Every crater is labelled in tiny script.',
  saturn: 'Saturn and its rings, engraved with loving care.',
  barometer: 'The barometer needle leans towards CHANGE.',
  observingChair: 'An observing chair, its seat wound up to the height of the eyepiece.',
  crate: 'The packing crate the new telescope came in. Empty now, but for straw.',
  deskChair: 'Voss’s desk chair, pushed back as if she left in a hurry.',
};

// The bookshelf, four shelves of nine. [title, author, line]. Voss's own book (line
// null) hides half of the torn page. LEVER_BOOKS are the four she quotes around the room.
export const BOOKS = [
  // Top shelf
  ['The Story of the Heavens', 'Ball', 'A pressed violet marks the chapter on comets.'],
  ['Outlines of Astronomy', 'Herschel', 'The spine cracks as you open it. Nothing inside.'],
  ['Popular Astronomy', 'Newcomb', 'A well-read copy. Nothing tucked between the pages.'],
  ['The Planet Mars', 'Flammarion', 'In French. Someone has underlined every mention of canals, with a question mark.'],
  ['Other Worlds than Ours', 'Proctor', 'Just the book.'],
  ['Star-Land', 'Ball', 'A book of talks for young people. Ball again.'],
  ['The Moon', 'Nasmyth', 'Beautiful plates of plaster lunar models. Nothing else.'],
  ['Comets and Meteors', 'Kirkwood', 'A dried leaf falls out. Only a leaf.'],
  ['Nautical Almanac', 'Admiralty', 'Last year’s. This year’s copy is not here.'],
  // Second shelf
  ['A Cycle of Celestial Objects', 'Smyth', 'Just the book.'],
  ['The Spectroscope', 'Lockyer', 'The diagrams have been coloured in by hand, in red and blue.'],
  ['Half-Hours with the Telescope', 'Proctor', 'A child’s copy, her name inside in careful capitals.'],
  ['Cosmos', 'Humboldt', 'Heavy enough to stop a door. A ribbon marks the first volume.'],
  ['The Heavens', 'Guillemin', 'The engravings are lovely. Nothing between them.'],
  ['The Mechanism of the Heavens', 'Somerville', 'Mrs Somerville’s great book. Voss has written “bravo” in the margin.'],
  ['System of the World', 'Laplace', 'In French again. Untouched.'],
  ['The Plurality of Worlds', 'Whewell', 'Every other page argues with the last.'],
  ['Handbook of Descriptive Astronomy', 'Chambers', 'Nothing tucked inside.'],
  // Third shelf
  ['Sidereus Nuncius', 'Galileo', 'A slim facsimile, handled with care.'],
  ['An Easy Guide to the Constellations', 'Gall', 'Written for beginners. Well loved all the same.'],
  ['Monthly Notices', 'R.A.S.', 'A bound run of the Society’s journal. Her name appears in the index.'],
  ['Faint Lights: Notes on Variable Stars', 'E. Voss', null],
  ['The Sun', 'Young', 'Just the book.'],
  ['Celestial Objects for Common Telescopes', 'Webb', 'Every margin is full of her pencilled notes.'],
  ['Uranometria', 'Bayer', 'An old star atlas, too fragile to leaf through.'],
  ['Astronomical Myths', 'Blake', 'Stories of the constellations, lightly foxed.'],
  ['Double Stars', 'Crossley', 'Nothing tucked inside.'],
  // Bottom shelf
  ['Essays on Astronomy', 'Proctor', 'Proctor again. She must have liked him.'],
  ['Principia', 'Newton', 'In Latin. The ribbon has never been moved.'],
  ['Telescopic Work for Starlight Evenings', 'Denning', 'Practical, and much thumbed.'],
  ['The Orbs of Heaven', 'Mitchel', 'An American book, very eloquent about comets.'],
  ['The Unseen Universe', 'Stewart & Tait', 'Heavy going. The bookmark is on page nine.'],
  ['Recreations in Astronomy', 'Warren', 'Just the book.'],
  ['Lectures on Light', 'Tyndall', 'A lecture ticket is still tucked in the flyleaf.'],
  ['On the Connexion of the Physical Sciences', 'Somerville', 'Somerville again, the spine sunned pale.'],
  ['Elements of Astronomy', 'Lockyer', 'A schoolbook, with a schoolgirl’s doodles of Saturn.'],
];
export const BOOKS_PER_SHELF = 9;
export const LEVER_BOOKS = [
  'The Story of the Heavens',
  'Cosmos',
  'Celestial Objects for Common Telescopes',
  'Lectures on Light',
];

// The enciphered message to the Society, as the register printed it. CIPHER is PLAIN
// run through the wheel (inner A under outer V); the tape shows CIPHER in Morse.
export const TELEGRAM = {
  handedIn: 'Kestrel Point',
  to: 'The Secretary, Royal Astronomical Society, Burlington House, London',
  plain: 'HOUR NINETEEN',
  cipher: 'MTZW SNSJYJJS',
  from: 'VOSS',
};

// Found in the cloak pocket: the order of the trunk labels.
export const ECLIPSE_NOTE = {
  heading: 'On the back of an old steamer ticket',
  body: [
    'Four total eclipses I have chased across the world, and every one has left its label on my trunk.',
    'Grenada came after Natal.',
    'Iona came before Natal — but it was not my first.',
    'And Riga was not my last.',
    'I set the trunk’s lock to spell them out in the order I saw them.',
  ],
  signature: 'E.V.',
};
export const TRUNK_LABELS = ['NATAL', 'RIGA', 'GRENADA', 'IONA'];
export const TRUNK_WORD = 'RING';

// Under the teacup's saucer.
export const SAUCER_NOTE = {
  heading: 'A note folded under the saucer',
  body: [
    'Forgot the tea again. I always do, when the sky is clear.',
    'Ball says in “The Story of the Heavens” that the stars keep their appointments more faithfully than any man. I have one tonight, and I shall not be late for it.',
  ],
  signature: 'E.',
};

// Pasted to the back of the portrait.
export const PORTRAIT_NOTE = {
  heading: 'Pasted to the back of the canvas',
  body: [
    'Mother, at Kew, the summer she taught me the constellations.',
    'She kept Humboldt’s “Cosmos” by her bed, and would read me the line about nature being one great whole, and the whole being the thing worth seeing. I think of it every night I open the dome.',
  ],
  signature: 'E.V.',
};

// Inside the gramophone record's sleeve.
export const SLEEVE_NOTE = {
  heading: 'Tucked inside the record sleeve',
  body: [
    'A waltz for the long hours at the eyepiece.',
    'Tyndall, in his “Lectures on Light”: every star we see is a letter posted long ago, and still arriving. I like to think this one was addressed to me.',
  ],
  signature: 'E.',
};

// The three sightings for the star chart. Stars are named by constellation and a
// feature a player can see on the chart; `pair` gives the chart's star ids.
export const SIGHTINGS = [
  {
    id: 1,
    title: 'Sighting the first',
    text: 'From the brightest star of the Crook, through the jewel of the Crown.',
    pair: ['crook:0', 'crown:2'],
  },
  {
    id: 2,
    title: 'Sighting the second',
    text: 'From the brightest star of the Eagle, through the uppermost star of the Club.',
    pair: ['eagle:0', 'club:5'],
  },
  {
    id: 3,
    title: 'Sighting the third',
    text: 'From the brightest star of the Serpent, through the brightest star of the Club.',
    pair: ['serpent:7', 'club:1'],
  },
];


// The Almanac page from the locked map-chest drawer.
export const ALMANAC = {
  title: 'Nautical Almanac, 1893 — October',
  subtitle: 'Heliocentric longitudes of the superior planets, at noon',
  dates: ['1st', '9th', '17th', '25th'],
  rows: [
    ['Jupiter', '♃', [59, 60, 61, 62]],
    ['Saturn', '♄', [209, 210, 210, 211]],
    ['Uranus', '♅', [212, 212, 213, 213]],
    ['Neptune', '♆', [71, 71, 71, 71]],
  ],
  pencil: 'Only six rings on my orrery: Uranus and Neptune are too far out to bother with.',
};

// The coast chart in the map chest, and the directional lock on its bottom drawer.
export const ROUTE = {
  // Page directions of each stretch of the pencilled road, landmark to landmark.
  legs: ['up', 'right', 'right', 'down', 'right', 'up'],
  landmarks: ['Harbour', 'Chapel', 'Stone Cross', 'Old Well', 'Lych Gate', 'Gibbet Stone', 'Tower'],
  // The compass rose is drawn with north pointing to the right of the page.
  north: 'right',
};
export const COMPASS_FROM_PAGE = { right: 'N', down: 'E', left: 'S', up: 'W' };

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
