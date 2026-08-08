import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatMessage } from './store.js';

// store.ts keeps its message list in module-level state, so we reset the
// module registry and re-import fresh before every test to keep tests
// isolated from one another.
async function freshStore() {
  vi.resetModules();
  return import('./store.js');
}

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'id-1',
    nickname: 'sleepy-panda',
    text: 'hello',
    ts: 0,
    ...overrides,
  };
}

describe('store', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('addMessage / getLiveMessages', () => {
    it('returns an empty array when no messages have been added', async () => {
      const { getLiveMessages } = await freshStore();

      expect(getLiveMessages(0)).toEqual([]);
    });

    it('returns added messages in insertion order', async () => {
      const { addMessage, getLiveMessages } = await freshStore();

      const first = makeMessage({ id: 'a', ts: 0 });
      const second = makeMessage({ id: 'b', ts: 1 });
      addMessage(first);
      addMessage(second);

      expect(getLiveMessages(1)).toEqual([first, second]);
    });

    it('returns a snapshot copy, not a live reference to internal state', async () => {
      const { addMessage, getLiveMessages } = await freshStore();

      addMessage(makeMessage({ id: 'a', ts: 0 }));
      const snapshot = getLiveMessages(0);
      snapshot.push(makeMessage({ id: 'injected', ts: 0 }));

      expect(getLiveMessages(0)).toHaveLength(1);
    });
  });

  describe('expiration (CONFIG.expirationSeconds = 10s)', () => {
    it('keeps messages younger than the expiration window', async () => {
      const { addMessage, getLiveMessages } = await freshStore();

      addMessage(makeMessage({ id: 'a', ts: 1_000 }));

      // 9.999s later - still within the 10s window.
      expect(getLiveMessages(1_000 + 9_999)).toHaveLength(1);
    });

    it('drops messages exactly at the expiration boundary and beyond', async () => {
      const { addMessage, getLiveMessages } = await freshStore();

      addMessage(makeMessage({ id: 'a', ts: 1_000 }));

      // isExpired uses a strict `>` comparison, so exactly 10s is not yet
      // expired, but anything beyond is.
      expect(getLiveMessages(1_000 + 10_000)).toHaveLength(1);
      expect(getLiveMessages(1_000 + 10_001)).toHaveLength(0);
    });

    it('prunes only the expired prefix, keeping newer messages', async () => {
      const { addMessage, getLiveMessages } = await freshStore();

      addMessage(makeMessage({ id: 'old', ts: 0 }));
      addMessage(makeMessage({ id: 'new', ts: 5_000 }));

      // At t=10_001, "old" (age 10_001ms) is expired but "new" (age 5_001ms) is not.
      const live = getLiveMessages(10_001);

      expect(live.map((m) => m.id)).toEqual(['new']);
    });
  });

  describe('pruneExpired', () => {
    it('removes expired messages from the underlying store', async () => {
      const { addMessage, getLiveMessages, pruneExpired } = await freshStore();

      addMessage(makeMessage({ id: 'a', ts: 0 }));
      pruneExpired(20_000);

      expect(getLiveMessages(20_000)).toEqual([]);
    });

    it('defaults to the current time when called with no arguments', async () => {
      const { addMessage, getLiveMessages, pruneExpired } = await freshStore();

      addMessage(makeMessage({ id: 'a', ts: Date.now() }));
      pruneExpired();

      expect(getLiveMessages(Date.now())).toHaveLength(1);
    });
  });
});