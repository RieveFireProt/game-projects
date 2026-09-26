// Prints every recorded reading as JSON { id: text }, for tools/narrate.py.
// The ids match the narrator buttons in the game (engine/narrator.js).
import { ECLIPSE_NOTE, FINAL_LETTER, JOURNAL, LETTER, PORTRAIT_NOTE, SAUCER_NOTE, SIGHTINGS, SLEEVE_NOTE } from '../src/rooms/observatory/story.js';

const letter = (l) => [l.greeting, ...l.body, l.signoff, l.signature].filter(Boolean).join('\n\n');
// Voss's shouted words and initials read better spelled the way she'd say them.
const speakable = (text) => text.replace(/\bHOUR\b/g, 'hour').replace(/\bHEIGHT\b/g, 'height').replace(/\bE\.V\./g, 'E. V.');

const lines = {
  letter: letter(LETTER),
  'final-letter': letter(FINAL_LETTER),
  'note-eclipse': letter(ECLIPSE_NOTE),
  'note-saucer': letter(SAUCER_NOTE),
  'note-portrait': letter(PORTRAIT_NOTE),
  'note-sleeve': letter(SLEEVE_NOTE),
  'sighting-1': `${SIGHTINGS[0].title}. ${SIGHTINGS[0].text}`,
  'sighting-3': `${SIGHTINGS[2].title}. ${SIGHTINGS[2].text}`,
};
JOURNAL.forEach((entry, i) => {
  if (entry.date) lines[`journal-${i}`] = [`${entry.date}.`, ...entry.text].join('\n\n');
});
for (const id of Object.keys(lines)) lines[id] = speakable(lines[id]);
console.log(JSON.stringify(lines, null, 2));
