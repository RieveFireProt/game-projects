// Puzzle registry and hint ladders (nudge → stronger hint → answer).
// This is the source of truth for the hint panel and, later, the AI game master.

export const puzzles = [
  {
    id: 'drawer',
    title: 'The locked desk drawer',
    available: () => true,
    solved: (s) => s.has('drawer.open'),
    hints: [
      'Voss’s letter says the lock is set to “the moment time stood still.” Is anything in this room frozen in time?',
      'Take a close look at the clock on the wall above the desk.',
      'The clock stopped at 11:47. Set the lock to 1 1 4 7.',
    ],
  },
  {
    id: 'torn-page',
    title: 'The missing journal page',
    available: (s) => s.hasItem('journal'),
    solved: (s) => s.has('page.assembled'),
    hints: [
      'The journal’s orrery page is missing. Read the entry for the 13th of October.',
      '“Where I keep my spare eyes” — what does an astronomer keep spare eyepieces in? And Voss wrote a book of her own.',
      'One half is in the eyepiece case beside the telescope. The other is inside the book by E. Voss on the bookshelf.',
    ],
  },
  {
    id: 'orrery',
    title: 'The orrery',
    available: (s) => s.has('page.assembled'),
    solved: (s) => s.has('orrery.solved'),
    hints: [
      'The assembled page shows where each planet stood on the night of the discovery.',
      'Turn each ring until its planet matches the drawing. Count positions from the brass marker.',
      'Mercury at III, Venus at VI, Earth at I, Mars at IV.',
    ],
  },
  {
    id: 'telegram',
    title: 'The enciphered telegram',
    available: (s) => s.hasItem('cipher-wheel'),
    solved: (s) => s.has('telegram.decoded'),
    hints: [
      'The telegram is enciphered, and you found something in the desk drawer that turns letters into other letters.',
      'The journal (11th October) says the wheel’s setting is the letter above the observatory door.',
      'The star above the door shows a V. Turn the wheel so A sits under V, then decode: THE HOUR IS NINETEEN.',
    ],
  },
  {
    id: 'telescope',
    title: 'The great telescope',
    available: (s) => s.has('telegram.decoded') || s.hasItem('lens'),
    solved: (s) => s.has('telescope.solved'),
    hints: [
      'The last journal entry splits the position in two: the HOUR and the HEIGHT. You also need the lens.',
      'The hour is in the decoded telegram. The height is where the Lyre (the symbol on the lens) sits on the star chart.',
      'Seat the lens, set HOUR to 19 and HEIGHT to +40°, then look through the eyepiece.',
    ],
  },
];
