import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { WebSocketServer, WebSocket, type RawData } from 'ws';
import { CONFIG, toPublicConfig } from './config.js';
import { generateNickname } from './nickname.js';
import { censorMessage } from './filter.js';
import { addMessage, getLiveMessages, pruneExpired, type ChatMessage } from './store.js';
import { TokenBucket } from './rateLimit.js';

type ClientMeta = {
  nickname: string;
  bucket: TokenBucket;
};

const clients = new Map<WebSocket, ClientMeta>();

// --- HTTP: just the /config endpoint. Everything else is WS. ---
const httpServer = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/config') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      // Public, static-ish config — fine to cache briefly client-side.
      'Cache-Control': 'public, max-age=30',
    });
    res.end(JSON.stringify(toPublicConfig()));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ noServer: true });

httpServer.on('upgrade', (req, socket, head) => {
  const origin = req.headers.origin;
  if (!origin || !(CONFIG.allowedOrigins as readonly string[]).includes(origin)) {
    socket.destroy();
    return;
  }

  if (clients.size >= CONFIG.maxConnections) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

function send(ws: WebSocket, payload: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function broadcast(payload: unknown): void {
  const data = JSON.stringify(payload);
  for (const ws of clients.keys()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(data);
  }
}

wss.on('connection', (ws) => {
  const nickname = generateNickname();
  clients.set(ws, { nickname, bucket: new TokenBucket() });

  // Welcome frame: tell the client who they are + replay recent history.
  send(ws, { type: 'welcome', nickname, config: toPublicConfig() });
  send(ws, { type: 'backlog', messages: getLiveMessages() });

  ws.on('message', (raw: RawData) => {
    const meta = clients.get(ws);
    if (!meta) return;

    if (!meta.bucket.tryConsume()) {
      send(ws, { type: 'error', reason: 'rate_limited' });
      return;
    }

    let text: string;
    try {
      const parsed = JSON.parse(raw.toString());
      text = String(parsed?.text ?? '');
    } catch {
      send(ws, { type: 'error', reason: 'invalid_payload' });
      return;
    }

    text = text.trim();
    if (text.length === 0) return;
    if (text.length > CONFIG.maxMessageLength) {
      send(ws, { type: 'error', reason: 'message_too_long' });
      return;
    }

    // Raw `text` exists here only, briefly, in this closure — never stored,
    // never broadcast. Only the censored version below leaves this scope.
    const { censored } = censorMessage(text);

    const msg: ChatMessage = {
      id: randomUUID(),
      nickname: meta.nickname,
      text: censored,
      ts: Date.now(),
    };
    addMessage(msg);
    broadcast({ type: 'message', message: msg });
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Sweep expired messages out of the store periodically. Clients also
// locally hide messages once they age past config.expirationSeconds, so
// this is mainly about not leaking memory server-side, not UI correctness.
setInterval(() => pruneExpired(), 5_000);

const PORT = Number(process.env.PORT ?? 8080);
httpServer.listen(PORT, () => {
  console.log(`chat service listening on :${PORT}`);
});
