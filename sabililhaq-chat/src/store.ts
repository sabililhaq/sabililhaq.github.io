import { CONFIG } from './config.js';

export type ChatMessage = {
  id: string;
  nickname: string;
  text: string; // already censored — never store raw text
  ts: number; // epoch ms
};

// Small array is fine at this scale (single room, 30s window, hobby traffic).
// No need for a ring buffer with fixed capacity — time-based pruning alone
// keeps this bounded.
const messages: ChatMessage[] = [];

export function addMessage(msg: ChatMessage): void {
  messages.push(msg);
}

function isExpired(msg: ChatMessage, now: number): boolean {
  return now - msg.ts > CONFIG.expirationSeconds * 1000;
}

/** Call periodically to drop expired messages from memory. */
export function pruneExpired(now: number = Date.now()): void {
  while (messages.length > 0 && isExpired(messages[0]!, now)) {
    messages.shift();
  }
}

/** Snapshot of currently-live messages, for replay to new joiners. */
export function getLiveMessages(now: number = Date.now()): ChatMessage[] {
  pruneExpired(now);
  return messages.slice();
}
