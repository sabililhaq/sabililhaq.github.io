import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const astroConfig = readFileSync(
  fileURLToPath(new URL('../astro.config.mjs', import.meta.url)),
  'utf-8',
);
const deployWorkflow = readFileSync(
  fileURLToPath(new URL('../.github/workflows/deploy.yml', import.meta.url)),
  'utf-8',
);
const cname = readFileSync(
  fileURLToPath(new URL('../public/CNAME', import.meta.url)),
  'utf-8',
).trim();

describe('public site URL', () => {
  it('falls back to the custom domain in astro.config.mjs', () => {
    expect(astroConfig).toContain("process.env.SITE_URL ?? 'https://sabililhaq.com'");
    expect(astroConfig).not.toContain('sabililhaq.github.io');
  });

  it('builds GitHub Pages with the custom domain as SITE_URL', () => {
    expect(deployWorkflow).toMatch(/SITE_URL:\s*https:\/\/sabililhaq\.com/);
    expect(deployWorkflow).not.toMatch(/SITE_URL:\s*https:\/\/sabililhaq\.github\.io/);
  });

  it('publishes the same host in CNAME', () => {
    expect(cname).toBe('sabililhaq.com');
  });
});
