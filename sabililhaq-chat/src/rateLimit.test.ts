import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenBucket } from './rateLimit.js';
import { CONFIG } from './config.js';

describe('TokenBucket', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows exactly `burst` consumptions immediately, then denies', () => {
    const bucket = new TokenBucket(3, 1);

    expect(bucket.tryConsume()).toBe(true);
    expect(bucket.tryConsume()).toBe(true);
    expect(bucket.tryConsume()).toBe(true);
    expect(bucket.tryConsume()).toBe(false);
  });

  it('refills tokens over time at refillPerSec', () => {
    const bucket = new TokenBucket(1, 1);

    expect(bucket.tryConsume()).toBe(true);
    expect(bucket.tryConsume()).toBe(false);

    vi.setSystemTime(new Date('2024-01-01T00:00:01.000Z'));

    expect(bucket.tryConsume()).toBe(true);
    expect(bucket.tryConsume()).toBe(false);
  });

  it('does not refill above the burst capacity even after a long idle period', () => {
    const bucket = new TokenBucket(2, 1);

    expect(bucket.tryConsume()).toBe(true);
    expect(bucket.tryConsume()).toBe(true);
    expect(bucket.tryConsume()).toBe(false);

    // Idle for a very long time - tokens should cap at `burst`, not
    // accumulate unbounded.
    vi.setSystemTime(new Date('2024-01-01T01:00:00.000Z'));

    expect(bucket.tryConsume()).toBe(true);
    expect(bucket.tryConsume()).toBe(true);
    expect(bucket.tryConsume()).toBe(false);
  });

  it('does not grant a token for partial refill amounts below 1', () => {
    const bucket = new TokenBucket(1, 1);

    expect(bucket.tryConsume()).toBe(true);
    expect(bucket.tryConsume()).toBe(false);

    // Only half a second elapsed => +0.5 tokens, still < 1.
    vi.setSystemTime(new Date('2024-01-01T00:00:00.500Z'));

    expect(bucket.tryConsume()).toBe(false);
  });

  it('accumulates fractional tokens across multiple partial refills', () => {
    const bucket = new TokenBucket(1, 1);

    expect(bucket.tryConsume()).toBe(true);
    expect(bucket.tryConsume()).toBe(false);

    vi.setSystemTime(new Date('2024-01-01T00:00:00.500Z'));
    expect(bucket.tryConsume()).toBe(false);

    vi.setSystemTime(new Date('2024-01-01T00:00:01.000Z'));
    expect(bucket.tryConsume()).toBe(true);
  });

  it('supports a higher refill rate than 1 token/sec', () => {
    const bucket = new TokenBucket(1, 5);

    expect(bucket.tryConsume()).toBe(true);
    expect(bucket.tryConsume()).toBe(false);

    vi.setSystemTime(new Date('2024-01-01T00:00:00.200Z'));

    expect(bucket.tryConsume()).toBe(true);
  });

  it('uses CONFIG.rateLimit defaults when no arguments are provided', () => {
    const bucket = new TokenBucket();

    for (let i = 0; i < CONFIG.rateLimit.burst; i++) {
      expect(bucket.tryConsume()).toBe(true);
    }
    expect(bucket.tryConsume()).toBe(false);
  });
});