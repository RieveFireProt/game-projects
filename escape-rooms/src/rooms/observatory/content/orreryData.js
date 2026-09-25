// Shared by the torn journal page (the diagram), the Almanac and the orrery puzzle.

export const POSITIONS = 12; // stops per ring, every 30° of heliocentric longitude, clockwise from the marker
export const NUMERALS = Array.from({ length: POSITIONS }, (_, i) => `${i * 30}°`);

// `start` is where each ring sits when the players arrive (stop index).
export const PLANETS = [
  { name: 'Mercury', symbol: '☿', color: '#9a9a9a', start: 10 },
  { name: 'Venus', symbol: '♀', color: '#d8c08a', start: 2 },
  { name: 'Earth', symbol: '⊕', color: '#4a7ab0', start: 7 },
  { name: 'Mars', symbol: '♂', color: '#b0502a', start: 0 },
  { name: 'Jupiter', symbol: '♃', color: '#c89a68', start: 5 },
  { name: 'Saturn', symbol: '♄', color: '#d8c890', start: 11 },
];
export const INNER = 4; // the planets drawn on the torn page; the rest come from the Almanac
export const SATURN = 5; // missing from its arm until found

// Where each planet stood on the night of the discovery (stop index).
export const NIGHT_OF_DISCOVERY = [4, 9, 1, 6, 2, 7];
