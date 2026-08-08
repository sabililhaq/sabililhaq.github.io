import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const confPath = fileURLToPath(new URL('../deploy/ws.sabililhaq.com.conf', import.meta.url));
const source = readFileSync(confPath, 'utf-8');

describe('sabililhaq-chat/deploy/ws.sabililhaq.com.conf', () => {
  it('proxies to the chat backend on the same port as the systemd service (8080)', () => {
    expect(source).toMatch(/upstream chat_backend\s*\{[\s\S]*?server 127\.0\.0\.1:8080;/);
  });

  it('serves the ws.sabililhaq.com hostname', () => {
    const occurrences = source.match(/server_name ws\.sabililhaq\.com;/g) ?? [];
    expect(occurrences.length).toBeGreaterThanOrEqual(2);
  });

  it('redirects plain HTTP (port 80) to HTTPS', () => {
    expect(source).toMatch(/listen 80;/);
    expect(source).toMatch(/return 301 https:\/\/\$host\$request_uri;/);
  });

  it('terminates TLS on port 443 with http2', () => {
    expect(source).toMatch(/listen 443 ssl http2;/);
  });

  it('proxies the /config endpoint used by the frontend to fetch public config', () => {
    expect(source).toMatch(/location \/config \{[\s\S]*?proxy_pass http:\/\/chat_backend;/);
  });

  it('sets the Upgrade/Connection headers required for WebSocket proxying', () => {
    expect(source).toMatch(/proxy_set_header Upgrade \$http_upgrade;/);
    expect(source).toMatch(/proxy_set_header Connection "upgrade";/);
  });

  it('rate-limits and caps concurrent connections per client IP', () => {
    expect(source).toMatch(/limit_conn chat_conn \d+;/);
    expect(source).toMatch(/limit_req zone=chat_upgrade burst=\d+ nodelay;/);
  });

  it('documents that the rate-limit zones must be declared in the http{} scope', () => {
    expect(source).toMatch(/limit_req_zone\s+\$binary_remote_addr\s+zone=chat_upgrade/);
    expect(source).toMatch(/limit_conn_zone\s+\$binary_remote_addr\s+zone=chat_conn/);
  });

  it('forwards the real client IP to the backend', () => {
    expect(source).toContain('proxy_set_header X-Real-IP $remote_addr;');
    expect(source).toContain('proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
  });
});