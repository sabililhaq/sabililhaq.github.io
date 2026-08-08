import { CONFIG } from './config.js';

export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly burst: number = CONFIG.rateLimit.burst,
    private readonly refillPerSec: number = CONFIG.rateLimit.refillPerSec,
  ) {
    this.tokens = burst;
    this.lastRefill = Date.now();
  }

  /** Returns true if the action is allowed (and consumes a token). */
  tryConsume(): boolean {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.burst, this.tokens + elapsedSec * this.refillPerSec);
    this.lastRefill = now;

    if (this.tokens < 1) return false;
    this.tokens -= 1;
    return true;
  }
}
