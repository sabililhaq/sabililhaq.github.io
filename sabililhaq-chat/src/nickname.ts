const ADJECTIVES = [
  'sleepy', 'blue', 'curious', 'quiet', 'brave', 'gentle', 'lucky', 'clever',
  'quick', 'calm', 'wild', 'shy', 'bold', 'lazy', 'happy', 'grumpy',
  'silent', 'swift', 'tiny', 'fuzzy', 'golden', 'silver', 'misty', 'jolly',
];

const ANIMALS = [
  'panda', 'frog', 'otter', 'fox', 'owl', 'badger', 'sparrow', 'wolf',
  'rabbit', 'turtle', 'raccoon', 'hedgehog', 'crow', 'lynx', 'seal', 'heron',
  'gecko', 'mole', 'shrew', 'dove', 'moth', 'wren', 'ferret', 'stoat',
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/**
 * Assigned once per WebSocket connection, not per message.
 * Collisions between concurrent users are intentionally not deduped —
 * nicknames here are cosmetic and the room is ephemeral.
 */
export function generateNickname(): string {
  return `${pick(ADJECTIVES)}-${pick(ANIMALS)}`;
}
