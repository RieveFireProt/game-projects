// Shared by the torn journal page (the diagram) and the orrery puzzle.

export const POSITIONS = 8; // stops per ring, numbered I–VIII clockwise from the marker
export const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export const PLANETS = [
  { name: 'Mercury', symbol: '☿', color: '#9a9a9a', start: 6 },
  { name: 'Venus', symbol: '♀', color: '#d8c08a', start: 1 },
  { name: 'Earth', symbol: '⊕', color: '#4a7ab0', start: 4 },
  { name: 'Mars', symbol: '♂', color: '#b0502a', start: 7 },
];

// Where each planet stood on the night of the discovery (0-based stop index).
export const NIGHT_OF_DISCOVERY = [2, 5, 0, 3];
