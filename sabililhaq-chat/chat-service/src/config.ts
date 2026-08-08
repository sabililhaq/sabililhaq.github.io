// Single source of truth. The frontend fetches /config and must never
// hardcode these values — that's the whole point of the spec requirement.
const PROD_ALLOWED = ["https://sabililhaq.com", "https://www.sabililhaq.com"];

// During local development include common localhost origins so the browser
// can successfully upgrade the WebSocket connection. You can override by
// setting ALLOW_LOCALHOST=0 in your environment if you want stricter checks.
const DEV_ALLOWED =
  process.env.NODE_ENV === "production" && process.env.ALLOW_LOCALHOST !== "1"
    ? []
    : ["http://localhost:4321", "http://127.0.0.1:4321"];

export const CONFIG = {
  // How long a message stays visible / replayable to new joiners.
  expirationSeconds: 10,

  // Hard caps to keep a single shared, account-less room from being trivially abused.
  maxMessageLength: 500,
  maxConnections: 200,

  // Simple per-connection token bucket: allow BURST messages immediately,
  // refilling at REFILL_PER_SEC tokens/sec.
  rateLimit: {
    burst: 5,
    refillPerSec: 1,
  },

  // Must match the origin nginx/the browser will present. Reject anything else
  // at the WS upgrade so randos can't embed ws.sabililhaq.com elsewhere.
  // In development we also allow localhost origins so local dev works.
  allowedOrigins: [...PROD_ALLOWED, ...DEV_ALLOWED],
} as const;

export type PublicConfig = {
  expirationSeconds: number;
  maxMessageLength: number;
};

export function toPublicConfig(): PublicConfig {
  return {
    expirationSeconds: CONFIG.expirationSeconds,
    maxMessageLength: CONFIG.maxMessageLength,
  };
}
