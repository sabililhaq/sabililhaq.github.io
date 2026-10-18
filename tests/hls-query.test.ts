import { describe, expect, it } from 'vitest';
import { HLS_SAMPLES, resolveHlsRequest } from '../src/components/hls/query';

describe('resolveHlsRequest', () => {
  it('returns normal for empty search and base pathname', () => {
    const res = resolveHlsRequest('', '/hls');
    expect(res).toEqual({ type: 'normal' });
  });

  it('resolves valid ?s= query param', () => {
    const res1 = resolveHlsRequest('?s=1', '/hls');
    expect(res1).toEqual({
      type: 'sample',
      index: 1,
      sample: HLS_SAMPLES[0],
      autoplay: true,
    });

    const res2 = resolveHlsRequest('?s=2', '/hls');
    expect(res2).toEqual({
      type: 'sample',
      index: 2,
      sample: HLS_SAMPLES[1],
      autoplay: true,
    });
  });

  it('resolves valid ?sample= query param', () => {
    const res = resolveHlsRequest('?sample=2', '/hls');
    expect(res).toEqual({
      type: 'sample',
      index: 2,
      sample: HLS_SAMPLES[1],
      autoplay: true,
    });
  });

  it('resolves naked numeric query param like ?1 or ?2', () => {
    const res1 = resolveHlsRequest('?1', '/hls');
    expect(res1).toEqual({
      type: 'sample',
      index: 1,
      sample: HLS_SAMPLES[0],
      autoplay: true,
    });

    const res2 = resolveHlsRequest('?2', '/hls');
    expect(res2).toEqual({
      type: 'sample',
      index: 2,
      sample: HLS_SAMPLES[1],
      autoplay: true,
    });
  });

  it('redirects to /hls when query param is out of bounds (e.g. ?s=3 when only 2 samples exist)', () => {
    expect(resolveHlsRequest('?s=3', '/hls')).toEqual({ type: 'redirect', target: '/hls' });
    expect(resolveHlsRequest('?sample=3', '/hls')).toEqual({ type: 'redirect', target: '/hls' });
    expect(resolveHlsRequest('?3', '/hls')).toEqual({ type: 'redirect', target: '/hls' });
    expect(resolveHlsRequest('?s=0', '/hls')).toEqual({ type: 'redirect', target: '/hls' });
    expect(resolveHlsRequest('?s=-1', '/hls')).toEqual({ type: 'redirect', target: '/hls' });
    expect(resolveHlsRequest('?s=abc', '/hls')).toEqual({ type: 'redirect', target: '/hls' });
  });

  it('resolves path params like /hls/1 and /hls/2', () => {
    const res1 = resolveHlsRequest('', '/hls/1');
    expect(res1).toEqual({
      type: 'sample',
      index: 1,
      sample: HLS_SAMPLES[0],
      autoplay: true,
    });

    const res2 = resolveHlsRequest('', '/hls/2/');
    expect(res2).toEqual({
      type: 'sample',
      index: 2,
      sample: HLS_SAMPLES[1],
      autoplay: true,
    });
  });

  it('redirects to /hls when path param is out of bounds (e.g. /hls/3)', () => {
    expect(resolveHlsRequest('', '/hls/3')).toEqual({ type: 'redirect', target: '/hls' });
    expect(resolveHlsRequest('', '/hls/0')).toEqual({ type: 'redirect', target: '/hls' });
    expect(resolveHlsRequest('', '/hls/99')).toEqual({ type: 'redirect', target: '/hls' });
  });

  it('resolves custom stream URL via ?url= or ?src=', () => {
    const res1 = resolveHlsRequest('?url=https://example.com/test.m3u8', '/hls');
    expect(res1).toEqual({
      type: 'custom',
      url: 'https://example.com/test.m3u8',
      autoplay: true,
    });

    const res2 = resolveHlsRequest('?src=https://example.com/test.m3u8&autoplay=false', '/hls');
    expect(res2).toEqual({
      type: 'custom',
      url: 'https://example.com/test.m3u8',
      autoplay: false,
    });
  });
});
