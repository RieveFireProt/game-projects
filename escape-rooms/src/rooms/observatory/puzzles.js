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
      '“Where I keep my spare eyes”: spare eyepieces live in a case. And Voss wrote a book of her own; look along the bookshelf.',
      'One half is under the lining of the eyepiece case by the telescope; the other is inside “Faint Lights” by E. Voss on the bookshelf. Open either half from your satchel and fit them together.',
    ],
  },
  {
    id: 'orrery',
    title: 'The orrery',
    available: (s) => s.has('page.assembled'),
    solved: (s) => s.has('orrery.solved'),
    hints: [
      'The pieced-together page shows where each planet stood on the night of the discovery.',
      'Turn each ring until its planet matches the drawing. Count the stops from the brass marker, using the numerals round the edge.',
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
      'The star above the door shows a V. Turn the inner SECRET ring until its A sits under the V of the outer CLEAR ring. Find each telegram letter on the inner ring and write down the outer letter above it: THE HOUR IS NINETEEN.',
    ],
  },
  {
    id: 'star-chart',
    title: 'The height',
    available: (s) => s.hasItem('lens') || s.has('telescope.lens'),
    solved: (s) => s.has('telescope.solved'),
    hints: [
      'The lens has a small symbol engraved on its rim. Have you seen that symbol anywhere else in the room?',
      'Every constellation on the star chart is marked with a symbol. Find the lens’s symbol there and read the line of height it sits on.',
      'The symbol is the Lyre, and it sits on the +40° line. HEIGHT is +40°.',
    ],
  },
  {
    id: 'telescope',
    title: 'The great telescope',
    available: (s) => s.has('telegram.decoded') || s.hasItem('lens') || s.has('telescope.lens'),
    solved: (s) => s.has('telescope.solved'),
    hints: [
      'The last journal entry (14th October) says the telescope needs three things: the lens, the HOUR and the HEIGHT.',
      'Seat the lens in the socket beside the eyepiece. The HOUR is in the decoded telegram; the HEIGHT comes from the star chart.',
      'Seat the lens, set HOUR to 19 and HEIGHT to +40°, then look through the eyepiece.',
    ],
  },
];
