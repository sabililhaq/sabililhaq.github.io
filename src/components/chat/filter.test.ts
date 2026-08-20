import { describe, expect, it } from 'vitest';
import { censorMessage } from './filter.ts';

describe('censorMessage', () => {
  it('leaves clean text unchanged', () => {
    const result = censorMessage('hello there, how are you?');

    expect(result).toEqual({
      censored: 'hello there, how are you?',
      hadMatch: false,
    });
  });

  it('returns hadMatch=false for empty input', () => {
    const result = censorMessage('');

    expect(result).toEqual({ censored: '', hadMatch: false });
  });

  it('censors the custom banned word "sabililhaq" with asterisks', () => {
    const result = censorMessage('this is sabililhaq talking');

    expect(result.hadMatch).toBe(true);
    expect(result.censored).toBe('this is ********** talking');
  });

  it('matches the custom banned word case-insensitively', () => {
    const result = censorMessage('SABILILHAQ is loud');

    expect(result.hadMatch).toBe(true);
    expect(result.censored).toBe('********** is loud');
  });

  it('censors a known Indonesian-dataset profanity term', () => {
    const result = censorMessage('dasar anjing lu');

    expect(result.hadMatch).toBe(true);
    expect(result.censored).not.toContain('anjing');
    expect(result.censored).toContain('*');
  });

  it('does not apply the English dataset', () => {
    const result = censorMessage('what the shit is going on');

    expect(result.hadMatch).toBe(false);
    expect(result.censored).toBe('what the shit is going on');
  });

  it('preserves the overall string length when masking matches', () => {
    const input = 'hey sabililhaq!';
    const result = censorMessage(input);

    expect(result.censored).toHaveLength(input.length);
  });

  it('censors multiple separate occurrences independently', () => {
    const result = censorMessage('sabililhaq said hi to sabililhaq');

    expect(result.hadMatch).toBe(true);
    expect(result.censored).toBe('********** said hi to **********');
  });

  it('preserves surrounding punctuation and whitespace', () => {
    const result = censorMessage('  sabililhaq, really?  ');

    expect(result.censored).toBe('  **********, really?  ');
  });

  it('does not flag substrings that merely resemble the banned word', () => {
    const result = censorMessage('this word is totally unrelated');

    expect(result.hadMatch).toBe(false);
    expect(result.censored).toBe('this word is totally unrelated');
  });

  it('handles adjacent repeated occurrences without throwing or truncating', () => {
    const input = 'sabililhaqsabililhaq';

    expect(() => censorMessage(input)).not.toThrow();
    const result = censorMessage(input);
    expect(result.censored).toHaveLength(input.length);
    expect(result.hadMatch).toBe(true);
  });
});