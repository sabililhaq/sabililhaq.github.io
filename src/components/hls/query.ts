export type HLSSample = {
  name: string;
  url: string;
};

export const HLS_SAMPLES: HLSSample[] = [
  {
    name: 'Taman Literasi CCTV (Live)',
    url: 'https://dki-jkt.balitower.co.id:7028/501478_JKS_SATPOLPP_TAMAN-LITERASI-C01_CCTV-01/tracks-v1/index.fmp4.m3u8',
  },
  {
    name: 'Bundaran HI CCTV',
    url: 'https://dki-jkt.balitower.co.id:7028/502493_JKP_SATPOL-PP_SIMPANG-JL.-MH.-THAMRIN-C09_CCTV-01/tracks-v1/index.fmp4.m3u8',
  },
];

export type HlsRequestResolution =
  | { type: 'sample'; index: number; sample: HLSSample; autoplay: boolean }
  | { type: 'custom'; url: string; autoplay: boolean }
  | { type: 'redirect'; target: string }
  | { type: 'normal' };

/**
 * Resolves the requested stream from URL search params and/or pathname.
 *
 * Supports:
 * - Query params: ?s=1, ?sample=1, ?1
 * - Path params: /hls/1, /hls/2
 * - Custom stream URL: ?url=... or ?src=...
 * - Out-of-bounds index (e.g. 3 when only 2 exist) -> redirects to /hls
 */
export function resolveHlsRequest(
  search: string,
  pathname: string,
  samples: HLSSample[] = HLS_SAMPLES
): HlsRequestResolution {
  // 1. Check path parameter: e.g. /hls/1 or /hls/2
  const normalizedPath = pathname.replace(/\/+$/, '');
  const pathMatch = normalizedPath.match(/\/hls\/([^/?#]+)$/);
  if (pathMatch) {
    const rawId = pathMatch[1];
    const num = parseInt(rawId, 10);
    if (!isNaN(num) && String(num) === rawId) {
      if (num >= 1 && num <= samples.length) {
        return {
          type: 'sample',
          index: num,
          sample: samples[num - 1],
          autoplay: true,
        };
      }
      return { type: 'redirect', target: '/hls' };
    }
  }

  // 2. Check query params: e.g. ?s=1, ?sample=1, ?1, ?url=...
  const query = search.startsWith('?') ? search.slice(1) : search;
  if (!query) {
    return { type: 'normal' };
  }

  const params = new URLSearchParams(query);

  // Custom stream URL
  const customUrl = params.get('url') || params.get('src');
  if (customUrl) {
    return {
      type: 'custom',
      url: customUrl.trim(),
      autoplay: params.get('autoplay') !== 'false',
    };
  }

  // ?sample= or ?s= parameter
  const sampleParam = params.get('sample') || params.get('s');
  if (sampleParam !== null) {
    const trimmed = sampleParam.trim();
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && String(num) === trimmed && num >= 1 && num <= samples.length) {
      return {
        type: 'sample',
        index: num,
        sample: samples[num - 1],
        autoplay: true,
      };
    }
    return { type: 'redirect', target: '/hls' };
  }

  // Naked numeric query, e.g. ?1 or ?2
  const nakedMatch = query.match(/^(\d+)(?:&|$)/);
  if (nakedMatch) {
    const num = parseInt(nakedMatch[1], 10);
    if (num >= 1 && num <= samples.length) {
      return {
        type: 'sample',
        index: num,
        sample: samples[num - 1],
        autoplay: true,
      };
    }
    return { type: 'redirect', target: '/hls' };
  }

  return { type: 'normal' };
}
