import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const servicePath = fileURLToPath(
  new URL('../deploy/sabililhaq-chat.service', import.meta.url),
);
const source = readFileSync(servicePath, 'utf-8');

function sectionBody(section: string): string {
  const match = source.match(new RegExp(`\\[${section}\\]([\\s\\S]*?)(?:\\n\\[|$)`));
  return match ? match[1] : '';
}

describe('sabililhaq-chat/deploy/sabililhaq-chat.service', () => {
  it('is a well-formed systemd unit with Unit, Service and Install sections', () => {
    expect(source).toMatch(/^\[Unit\]/m);
    expect(source).toMatch(/^\[Service\]/m);
    expect(source).toMatch(/^\[Install\]/m);
  });

  it('starts the compiled server via node against dist/server.js', () => {
    expect(sectionBody('Service')).toMatch(/ExecStart=\/usr\/bin\/node dist\/server\.js/);
  });

  it('runs from the working directory matching the systemd deploy layout', () => {
    expect(sectionBody('Service')).toContain('WorkingDirectory=/opt/sabililhaq-chat');
  });

  it('runs as an unprivileged, dedicated user', () => {
    expect(sectionBody('Service')).toContain('User=chatapp');
  });

  it('configures PORT=8080 to match server.ts default and the nginx upstream', () => {
    expect(sectionBody('Service')).toContain('Environment=PORT=8080');
  });

  it('restarts automatically on failure', () => {
    expect(sectionBody('Service')).toMatch(/Restart=on-failure/);
    expect(sectionBody('Service')).toMatch(/RestartSec=\d+/);
  });

  it('applies basic sandboxing hardening', () => {
    const service = sectionBody('Service');
    expect(service).toContain('NoNewPrivileges=true');
    expect(service).toContain('ProtectSystem=strict');
    expect(service).toContain('ProtectHome=true');
    expect(service).toContain('PrivateTmp=true');
  });

  it('is enabled for the multi-user target', () => {
    expect(sectionBody('Install')).toContain('WantedBy=multi-user.target');
  });
});