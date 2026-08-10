import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateNickname } from './nickname.js';

describe('generateNickname', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a string in "adjective-animal" format', () => {
    const nickname = generateNickname();

    expect(nickname).toMatch(/^[a-z]+-[a-z]+$/);
  });

  it('produces exactly one hyphen separating two lowercase words', () => {
    const nickname = generateNickname();

    const parts = nickname.split('-');
    expect(parts).toHaveLength(2);
    expect(parts[0]!.length).toBeGreaterThan(0);
    expect(parts[1]!.length).toBeGreaterThan(0);
  });

  it('picks the first adjective/animal when Math.random returns 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(generateNickname()).toBe('sleepy-panda');
  });

  it('picks the last adjective/animal when Math.random is just under 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999);

    expect(generateNickname()).toBe('jolly-stoat');
  });

  it('generates a variety of nicknames across many calls', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      seen.add(generateNickname());
    }

    // 24 adjectives * 24 animals = 576 combinations; with 200 draws we
    // should see meaningfully more than a single repeated value.
    expect(seen.size).toBeGreaterThan(1);
  });
});