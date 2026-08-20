import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

async function loadConfig() {
  vi.resetModules();
  return import('./config.js');
}

describe('config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  describe('allowedOrigins', () => {
    it('includes localhost origins outside of production', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.ALLOW_LOCALHOST;

      const { CONFIG } = await loadConfig();

      expect(CONFIG.allowedOrigins).toEqual(
        expect.arrayContaining([
          'https://sabililhaq.com',
          'https://www.sabililhaq.com',
          'http://localhost:4321',
          'http://127.0.0.1:4321',
        ]),
      );
    });

    it('excludes localhost origins in production by default', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_LOCALHOST;

      const { CONFIG } = await loadConfig();

      expect(CONFIG.allowedOrigins).toEqual([
        'https://sabililhaq.com',
        'https://www.sabililhaq.com',
      ]);
      expect(CONFIG.allowedOrigins).not.toContain('http://localhost:4321');
    });

    it('never includes localhost origins in production, even when ALLOW_LOCALHOST=1', async () => {
      process.env.NODE_ENV = 'production';
      process.env.ALLOW_LOCALHOST = '1';

      const { CONFIG } = await loadConfig();

      expect(CONFIG.allowedOrigins).toEqual([
        'https://sabililhaq.com',
        'https://www.sabililhaq.com',
      ]);
      expect(CONFIG.allowedOrigins).not.toContain('http://localhost:4321');
      expect(CONFIG.allowedOrigins).not.toContain('http://127.0.0.1:4321');
    });

    it('does not re-include localhost origins in production for other ALLOW_LOCALHOST values', async () => {
      process.env.NODE_ENV = 'production';
      process.env.ALLOW_LOCALHOST = 'true';

      const { CONFIG } = await loadConfig();

      expect(CONFIG.allowedOrigins).toEqual([
        'https://sabililhaq.com',
        'https://www.sabililhaq.com',
      ]);
    });

    it('always includes the production sabililhaq.com origins', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_LOCALHOST;

      const { CONFIG } = await loadConfig();

      expect(CONFIG.allowedOrigins).toContain('https://sabililhaq.com');
      expect(CONFIG.allowedOrigins).toContain('https://www.sabililhaq.com');
    });
  });

  describe('CONFIG constants', () => {
    it('exposes sane defaults for message/connection limits', async () => {
      const { CONFIG } = await loadConfig();

      expect(CONFIG.expirationSeconds).toBeGreaterThan(0);
      expect(CONFIG.maxMessageLength).toBeGreaterThan(0);
      expect(CONFIG.maxConnections).toBeGreaterThan(0);
      expect(CONFIG.rateLimit.burst).toBeGreaterThan(0);
      expect(CONFIG.rateLimit.refillPerSec).toBeGreaterThan(0);
    });
  });

  describe('toPublicConfig', () => {
    it('returns only expirationSeconds and maxMessageLength', async () => {
      const { CONFIG, toPublicConfig } = await loadConfig();

      const publicConfig = toPublicConfig();

      expect(publicConfig).toEqual({
        expirationSeconds: CONFIG.expirationSeconds,
        maxMessageLength: CONFIG.maxMessageLength,
      });
      expect(Object.keys(publicConfig).sort()).toEqual(
        ['expirationSeconds', 'maxMessageLength'].sort(),
      );
    });

    it('does not leak internal fields like rateLimit, maxConnections or allowedOrigins', async () => {
      const { toPublicConfig } = await loadConfig();

      const publicConfig = toPublicConfig() as Record<string, unknown>;

      expect(publicConfig.rateLimit).toBeUndefined();
      expect(publicConfig.maxConnections).toBeUndefined();
      expect(publicConfig.allowedOrigins).toBeUndefined();
    });
  });
});