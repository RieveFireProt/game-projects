// Puzzle registry and hint ladders (nudge → stronger hint → answer).
// This is the source of truth for the hint panel and, later, the AI game master.
// SPOILERS: every answer in the room is in the last hint of a ladder.

const opened = (s) => s.has('drawer.open');

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
    available: opened,
    solved: (s) => s.has('page.assembled'),
    hints: [
      'The journal’s orrery page is missing. Read the entry for the 13th of October.',
      '“Where I keep my spare eyes”: spare eyepieces live in a case. And Voss wrote a book of her own; look along the bookshelf.',
      'One half is under the lining of the eyepiece case by the telescope; the other is inside “Faint Lights” by E. Voss, on the third shelf of the bookcase. Open either half from your satchel and fit them together.',
    ],
  },
  {
    id: 'saturn',
    title: 'The runaway planet',
    available: (s) => opened(s) || s.has('orrery.seen'),
    solved: (s) => s.has('taken.saturn'),
    hints: [
      'The orrery is missing a planet. The journal entry for the 12th of October says where he went.',
      '“Gone to ground among the fronds.” Is there anything in this room with fronds?',
      'Saturn is buried in the soil of the fern’s pot. Click the fern and feel in the soil.',
    ],
  },
  {
    id: 'map-chest',
    title: 'The map chest’s bottom drawer',
    available: opened,
    solved: (s) => s.has('mapchest.open'),
    hints: [
      'The bottom drawer’s lock pushes up, down, left and right, and it is engraved “the road home, as the compass has it.” One of the other drawers holds a chart with a road on it.',
      'Follow the pencilled road from the Harbour to the Tower, one push for each stretch between landmarks. But look carefully at the compass rose: north is not at the top of this chart.',
      'North points to the right of the page, so right is N, down is E, left is S and up is W. The road goes up, right, right, down, right, up: push W, N, N, E, N, W.',
    ],
  },
  {
    id: 'orrery',
    title: 'The orrery',
    available: (s) => s.has('page.assembled') || s.has('taken.almanac'),
    solved: (s) => s.has('orrery.solved'),
    hints: [
      'Every ring has to stand where its planet stood on the night of the 9th. The pieced-together page gives the four inner planets; the outer two are in the Almanac, and Saturn has to be back on his arm.',
      'Read each planet’s place in degrees and turn its ring until the planet points at that number on the rim. The Almanac gives Jupiter and Saturn for several dates; use the 9th.',
      'Mercury 120°, Venus 270°, Earth 30°, Mars 180°, Jupiter 60°, Saturn 210° (with Saturn fitted from the fern).',
    ],
  },
  {
    id: 'trunk',
    title: 'The steamer trunk',
    available: opened,
    solved: (s) => s.has('trunk.open'),
    hints: [
      'The journal (11th October) says the trunk’s lock remembers where the Moon’s shadow found Voss, in order. The trunk’s labels name the places. Something in the room tells you the order.',
      'Search Voss’s cloak on the coat stand by the door. The note in its pocket gives clues to the order of the four eclipses; spell the lock with the first letter of each place.',
      'Riga, then Iona, then Natal, then Grenada. Set the lock to R I N G.',
    ],
  },
  {
    id: 'telegram',
    title: 'The message on the tape',
    available: opened,
    solved: (s) => s.has('telegram.decoded'),
    hints: [
      'The register beside the telegraph key printed Voss’s last message in Morse. The code card from the desk drawer turns the marks into letters, but they are still enciphered.',
      'Read the tape into letters with the code card, then use the cipher wheel from the trunk. The journal (11th October) says the wheel’s setting is the letter above the door: V. Turn the inner ring so its A sits under the outer V; each tape letter on the inner ring has its clear letter above it.',
      'The tape reads MTZW SNSJYJJS, which decodes to HOUR NINETEEN.',
    ],
  },
  {
    id: 'bookshelf',
    title: 'The priest-hole',
    available: opened,
    solved: (s) => s.has('shelf.open'),
    hints: [
      'The journal (5th October) says tipping the right book on each of the four shelves opens a priest-hole: the four books Voss quotes in her notes around the room.',
      'Voss quotes a book in her journal, in a note under the teacup’s saucer, on the back of the portrait and inside the gramophone’s record sleeve. Tip each of those books forward.',
      'Tip “The Story of the Heavens” (top shelf), “Cosmos” (second shelf), “Celestial Objects for Common Telescopes” (third shelf) and “Lectures on Light” (bottom shelf). The priest-hole opens in the wall beside the bookcase.',
    ],
  },
  {
    id: 'cabinet',
    title: 'The instrument cabinet',
    available: opened,
    solved: (s) => s.has('cabinet.open'),
    hints: [
      'The cabinet needs a key. The journal entry for the 10th of October says where Voss keeps it.',
      '“Up among the wheels of the dome.” Something in the room lets you reach them.',
      'Climb the ladder under the dome slit to find the key on the rail, then use it on the cabinet.',
    ],
  },
  {
    id: 'red-sheet',
    title: 'Under the red ink',
    available: (s) => s.has('cabinet.open') || s.has('sighting.3') || s.has('sighting.1'),
    solved: (s) => s.has('sighting.2'),
    hints: [
      'The journal says one sighting lies “under my own red ink.” There is a sheet on the desk scribbled over in red.',
      'Red ink vanishes when you look at it through red glass. The instrument cabinet has some.',
      'Take the ruby glass from the cabinet, open the red sheet on the desk and drag the glass over it: the second sighting runs from the brightest star of the Eagle through the uppermost star of the Club.',
    ],
  },
  {
    id: 'star-chart',
    title: 'The height',
    available: (s) => opened(s) || s.has('sighting.1') || s.has('sighting.2') || s.has('sighting.3'),
    solved: (s) => s.has('chart.solved'),
    hints: [
      'The journal (14th October) says the HEIGHT comes from three sightings, each a line between two stars on the chart; where they cross is the new star. One is behind the stone, one under red ink, one with the charts.',
      'Stretch a thread on the chart for each sighting: click the first star, then the second. The constellations are marked by their symbols; “brightest” means the biggest star of the figure.',
      'Threads: Crook’s brightest to the Crown’s jewel; the Eagle’s brightest to the Club’s uppermost star; the Serpent’s brightest to the Club’s brightest. They cross beside the Lyre on the +40° line. HEIGHT is +40°.',
    ],
  },
  {
    id: 'telescope',
    title: 'The great telescope',
    available: (s) => s.has('telegram.decoded') || s.hasItem('lens') || s.has('telescope.lens') || s.has('chart.solved'),
    solved: (s) => s.has('telescope.solved'),
    hints: [
      'The last journal entry (14th October) says the telescope needs three things: the lens, the HOUR and the HEIGHT.',
      'Seat the lens from the orrery in the socket beside the eyepiece. The HOUR is in the message on the telegraph tape; the HEIGHT is where the star chart’s threads cross.',
      'Seat the lens, set HOUR to 19 and HEIGHT to +40°, then look through the eyepiece.',
    ],
  },
];
