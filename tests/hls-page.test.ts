import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LABS } from '../src/consts';

const hlsPagePath = fileURLToPath(new URL('../src/pages/hls.astro', import.meta.url));
const playerPath = fileURLToPath(new URL('../src/components/hls/HLSPlayer.astro', import.meta.url));
const slugPagePath = fileURLToPath(new URL('../src/pages/[slug].astro', import.meta.url));
const headerLinkPath = fileURLToPath(new URL('../src/components/HeaderLink.astro', import.meta.url));

const pageSource = readFileSync(hlsPagePath, 'utf-8');
const playerSource = readFileSync(playerPath, 'utf-8');

describe('src/pages/hls.astro', () => {
  it('imports and renders HLSPlayer component', () => {
    expect(pageSource).toMatch(/import HLSPlayer from ['"]\.\.\/components\/hls\/HLSPlayer\.astro['"]/);
    expect(pageSource).toMatch(/<HLSPlayer\s*\/>/);
  });

  it('imports and renders Header and Footer', () => {
    expect(pageSource).toMatch(/import Header from ['"]\.\.\/components\/Header\.astro['"]/);
    expect(pageSource).toMatch(/import Footer from ['"]\.\.\/components\/Footer\.astro['"]/);
    expect(pageSource).toContain('<Header />');
    expect(pageSource).toContain('<Footer />');
  });

  it('sets page title and a concise meta description without a redundant tagline', () => {
    expect(pageSource).toMatch(/title=\{`HLS Player \| \$\{SITE_TITLE\}`\}/);
    expect(pageSource).toContain('description="Play HTTP Live Streaming (HLS) video streams."');
    expect(pageSource).not.toContain('client-side');
    expect(pageSource).not.toContain('running in the browser');
  });

  it('links to a brief HLS overview', () => {
    expect(pageSource).toContain('href="https://www.cloudflare.com/learning/video/what-is-http-live-streaming/"');
    expect(pageSource).toContain('What is HLS?');
  });
});

describe('src/components/hls/HLSPlayer.astro', () => {
  it('includes required DOM element hooks', () => {
    for (const id of [
      'hls-form',
      'hls-url',
      'hls-video',
      'hls-load',
      'hls-sample-btn',
      'hls-clear-btn',
      'hls-status',
      'status-dot',
      'live-badge',
      'hls-autoplay',
      'hls-muted',
      'hls-error',
      'hls-error-text',
    ]) {
      expect(playerSource).toContain(`id="${id}"`);
    }
  });

  it('pre-populates the sample CCTV stream URL', () => {
    const sample = 'https://dki-jkt.balitower.co.id:7028/501478_JKS_SATPOLPP_TAMAN-LITERASI-C01_CCTV-01/tracks-v1/index.fmp4.m3u8';
    expect(playerSource).toContain(sample);
  });

  it('includes Bundaran HI CCTV sample', () => {
    const bundaranSample = 'https://dki-jkt.balitower.co.id:7028/502493_JKP_SATPOL-PP_SIMPANG-JL.-MH.-THAMRIN-C09_CCTV-01/tracks-v1/index.fmp4.m3u8';
    expect(playerSource).toContain(bundaranSample);
    expect(playerSource).toContain('Bundaran HI CCTV');
  });

  it('imports hls.js and supports HLS playback with fallback', () => {
    expect(playerSource).toMatch(/import Hls from ['"]hls\.js['"]/);
    expect(playerSource).toContain('Hls.isSupported()');
    expect(playerSource).toContain("video.canPlayType('application/vnd.apple.mpegurl')");
  });

  it('provides a video element configured with standard controls and inline playback', () => {
    expect(playerSource).toMatch(/<video[^>]*controls/);
    expect(playerSource).toMatch(/<video[^>]*playsinline/);
  });

  it('wires resolveHlsRequest to support query and path sample selection', () => {
    expect(playerSource).toContain('resolveHlsRequest');
    expect(playerSource).toContain('data-index=');
  });
});

describe('labs catalog integration', () => {
  it('adds HLS Player under Utilities with internal /hls url', () => {
    const hlsLab = LABS.find((lab) => lab.url === '/hls');
    expect(hlsLab).toBeDefined();
    expect(hlsLab!.label).toBe('HLS Player');
    expect(hlsLab!.group).toBe('Utilities');
    expect(hlsLab!.url.startsWith('http')).toBe(false);
    expect(hlsLab!.description).toBe('Play HLS video streams.');
    expect(hlsLab!.note).toBeUndefined();
  });

  it('reserves the hls slug so blog posts cannot take /hls', () => {
    const slugSource = readFileSync(slugPagePath, 'utf-8');
    const headerSource = readFileSync(headerLinkPath, 'utf-8');

    expect(slugSource).toContain("'hls'");
    expect(headerSource).toContain("'hls'");
  });

  it('provides static paths for each sample under /hls/[id]', () => {
    const sampleRoutePath = fileURLToPath(new URL('../src/pages/hls/[id].astro', import.meta.url));
    const sampleRouteSource = readFileSync(sampleRoutePath, 'utf-8');
    expect(sampleRouteSource).toContain('getStaticPaths');
    expect(sampleRouteSource).toContain('HLSPlayer');
  });

  it('provides 404 fallback redirecting /hls/* out-of-range paths to /hls', () => {
    const notFoundPath = fileURLToPath(new URL('../src/pages/404.astro', import.meta.url));
    const notFoundSource = readFileSync(notFoundPath, 'utf-8');
    expect(notFoundSource).toContain("window.location.pathname.startsWith('/hls/')");
    expect(notFoundSource).toContain("window.location.replace('/hls')");
  });
});
