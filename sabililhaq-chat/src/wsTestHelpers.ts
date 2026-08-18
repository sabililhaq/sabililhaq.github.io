// Shared helpers for the WebSocket integration tests in server.test.ts and
// server.max-connections.test.ts. Not a *.test.ts file, so vitest does not
// treat it as a test suite on its own.
import WebSocket from 'ws';

export async function waitForServerReady(url: string, timeoutMs = 5000): Promise<void> {
  const start = Date.now();
  for (;;) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not accepting connections yet, keep polling
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

export type ConnectedClient = {
  ws: WebSocket;
  /** Frames received since the socket was created (listener attached before open). */
  messages: unknown[];
};

/**
 * Open a WebSocket and collect frames from the start of the connection.
 * Attaching the message listener before `open` avoids missing the server's
 * initial welcome/backlog/presence frames, which are sent in the same tick.
 */
export function connectClient(wsUrl: string, origin?: string): Promise<ConnectedClient> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl, origin ? { origin } : undefined);
    const messages: unknown[] = [];

    ws.on('message', (data) => {
      messages.push(JSON.parse(data.toString()));
    });

    const onOpen = () => {
      cleanup();
      resolve({ ws, messages });
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    function cleanup() {
      ws.off('open', onOpen);
      ws.off('error', onError);
    }

    ws.once('open', onOpen);
    ws.once('error', onError);
  });
}

/**
 * Resolves once the connection is rejected (via error/close/unexpected-response
 * during the handshake) and rejects if the connection unexpectedly opens.
 */
export function expectConnectionRejected(wsUrl: string, origin?: string, timeoutMs = 3000): Promise<void> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl, origin ? { origin } : undefined);

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('connection was neither opened nor rejected within timeout'));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      ws.removeAllListeners();
      try {
        ws.terminate();
      } catch {
        // ignore
      }
    }

    ws.once('open', () => {
      cleanup();
      reject(new Error('expected the connection to be rejected, but it opened'));
    });
    ws.once('error', () => {
      cleanup();
      resolve();
    });
    ws.once('close', () => {
      cleanup();
      resolve();
    });
    ws.once('unexpected-response', () => {
      cleanup();
      resolve();
    });
  });
}

export function collectMessages(ws: WebSocket): unknown[] {
  const messages: unknown[] = [];
  ws.on('message', (data) => {
    messages.push(JSON.parse(data.toString()));
  });
  return messages;
}

export async function waitFor(predicate: () => boolean, timeoutMs = 3000, intervalMs = 20): Promise<void> {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('timed out waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}