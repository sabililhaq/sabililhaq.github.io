# CCTV Route Finder — Product & Technical Design

## 1. Objective

Build a browser-based tool that helps users discover publicly accessible CCTV cameras near a road journey.

Users enter an origin and destination, view available driving routes, and progressively discover nearby CCTV feeds along the selected route. They can inspect camera feeds directly when supported by the provider.

**Core user flow:** Enter A → B → select a route → inspect the most relevant nearby CCTV → reveal more cameras as needed.

The interface should follow the lightweight, map-centric control-panel design of my existing Geoproximity tool.

## 2. Existing Website: Preserve Geoproximity

My website already has an existing tool:

- **Geoproximity:** `https://sabililhaq.com/map`
- **New CCTV tool:** `https://sabililhaq.com/cctv`

These are two separate tools on the same website.

### Non-negotiable constraints

- Do not replace, repurpose, or break `/map`.
- Do not change Geoproximity's existing behavior, URL, or core UI.
- Implement the CCTV Route Finder as a standalone page at `/cctv`.
- Add navigation between the two tools where appropriate.
- Reuse existing styles, assets, and lightweight utilities when practical.
- Avoid introducing a complex shared framework solely to share code.
- Inspect the existing repository and deployment setup before making changes. Follow the project's existing conventions.

The existing Geoproximity tool compares a destination against multiple hubs using geographic distance. The CCTV tool is different: it discovers cameras near a road route and supports video playback.

## 3. Product Principles

1. **Browser-first:** No custom application backend, database, or stream server is required for the MVP.
2. **Map-first:** The map is the primary workspace; controls and camera results live in a compact panel.
3. **Progressive discovery:** Show one relevant camera initially. Reveal additional results only when requested.
4. **Real data only:** Never fabricate cameras, routes, playback URLs, availability, or routing metrics.
5. **Graceful degradation:** A failed stream must not prevent route planning or discovery of other cameras.
6. **Transparent limitations:** A camera being geographically close to a route does not guarantee that it points at the road or provides a useful view.
7. **Minimalism:** Keep the interface focused on route planning and camera inspection, not a general-purpose CCTV directory.

## 4. Layout and Visual Design

### Desktop

Use a full-height interactive map with a floating control panel on the left.

- Map: approximately 65–70% or more of the usable viewport.
- Control panel: compact, scrollable, and approximately 340–400 px wide.
- Panel: light background, restrained borders/shadows, clear spacing, and readable typography.
- Map: muted basemap that keeps routes and camera markers visually prominent.
- Avoid excessive buttons, large cards, decorative gradients, and unnecessary dashboard elements.

### Mobile

- Map occupies most of the viewport.
- Controls and results appear in a bottom sheet or compact overlay.
- The sheet must not permanently obscure most of the map.
- Keep route selection, camera playback, and “Show more cameras” usable on narrow screens.

### Shared website navigation

Provide a lightweight way to switch between:

- **Geoproximity** — `/map`
- **CCTV Route Finder** — `/cctv`

Use the existing site's typography, spacing, colors, and overall visual language where practical. Do not redesign the entire website.

## 5. Route Planning

### Inputs

The control panel should provide:

- Origin input: A
- Destination input: B
- Swap origin and destination
- Optional intermediate waypoints, if supported cleanly
- A button to calculate or update the route
- A way to select the active route when multiple alternatives exist

Use place/address autocomplete where a suitable geocoding provider is available. Also support setting origin or destination by clicking the map if practical.

Preserve the user's input when recalculating routes. Validate empty or invalid locations and display useful errors.

### Routing behavior

Use a real road-routing provider, such as OSRM or another compatible service, after checking its capabilities and terms.

- Default travel mode: driving.
- Request alternative routes when supported.
- Display up to three actual routes returned by the provider.
- Do not invent alternatives if only one route is available.
- Display distance and estimated duration only when returned by the routing provider.
- Clearly distinguish the selected route from alternatives.
- Selecting a different route must update camera relevance and ordering.

Possible route labels include “Fastest” and “Alternative,” but only use labels supported by the returned route data. Do not imply traffic-aware ETAs unless the provider actually supplies traffic-aware estimates.

### Route visualization

- Draw the selected route prominently.
- Draw alternative routes using subdued styling.
- Animate the selected route being drawn from origin to destination when a route is first selected or recalculated.
- Keep the animation short and unobtrusive.
- Avoid continuous animations that distract from the map.
- Display origin, destination, and optional waypoint markers.
- Fit the map to the route bounds after calculation.
- If a camera is selected, allow the map to focus on that camera without losing the route context.

If the provider returns only one route, the UI should remain useful without an alternative-route selector.

## 6. CCTV Discovery

### Initial state

Before a route is calculated, show a short instruction explaining how to get started.

After a route is calculated:

1. Find cameras in the available camera catalog near the selected route.
2. Rank them by geographic proximity to the route.
3. Display exactly one initial recommendation, if at least one valid result exists.
4. Provide a **“Show more cameras”** action to reveal additional results progressively.

Suggested panel copy:

**Might be relevant to your route**

“Public cameras near your selected journey.”

For an individual camera, show as much verified information as is available:

- Camera name
- Approximate distance from the route
- Distance along the journey from the origin, if calculated
- Provider name
- Playback action
- Link to the original public source
- Last verification date, if maintained

Do not display an online/offline badge unless there is a reliable way to verify current availability.

### Progressive reveal

- Initially show one camera.
- Each click on “Show more cameras” reveals a small batch, such as three additional cameras.
- Never show duplicate cameras across batches.
- Preserve the current list when the user expands it.
- Hide or disable the action when all available results have been revealed.
- Display a short end-of-results message when appropriate.

The batch size should be configurable in code.

### Ranking

Rank cameras using their shortest geographic distance to the selected route polyline.

Recommended MVP algorithm:

1. Get the selected route geometry.
2. Calculate each camera's minimum distance to the route.
3. Filter cameras using a configurable route corridor, initially around 500 metres.
4. Sort remaining cameras by distance to the route, nearest first.
5. Use distance along the journey from origin as a secondary ordering signal where useful.
6. Deduplicate camera IDs and, where appropriate, identical source feeds.
7. Reveal the sorted list progressively.

The corridor width must be configurable. Do not describe the default as a guaranteed optimal distance.

If route-distance calculations are too expensive for a large catalog, use a spatial prefilter or other lightweight optimization before calculating distances to the route geometry.

A camera outside the selected corridor should not appear in the main relevant-camera list by default. The interface may offer a wider search radius later as an optional feature.

### Camera and map synchronization

- Each displayed camera has a corresponding map marker.
- Selecting a camera card highlights its marker and focuses the map appropriately.
- Selecting a marker highlights the corresponding card.
- If the selected route changes, recalculate the camera list and clear or update selections that are no longer relevant.
- Keep markers consistent with the cameras currently shown in the panel.

Camera markers should be visually distinct from origin, destination, and waypoint markers.

## 7. Camera Data and Playback

### Initial catalog

Start with a small, curated catalog of verified public cameras rather than trying to ingest every possible CCTV feed immediately.

Use a static JSON file bundled with the frontend, for example:

`data/cameras.json`

Suggested schema:

```json
[
  {
    "id": "dki-literasi",
    "name": "Taman Literasi",
    "latitude": -6.243,
    "longitude": 106.799,
    "provider": "Public CCTV Provider",
    "playbackType": "embed",
    "playbackUrl": "https://example.com/public-camera",
    "sourceUrl": "https://example.com/source",
    "lastVerifiedAt": null
  }
]
```

The coordinates and URLs above are illustrative placeholders, not verified camera data.

Supported playback types should be explicit, for example:

- `hls`: a publicly accessible HLS manifest
- `embed`: a provider's public embed/player page
- `link`: an external source page when direct playback is unavailable

Validate records when loading the catalog. Ignore invalid coordinates, missing IDs, and malformed entries rather than allowing one bad record to break the page.

Keep the schema simple and extensible.

### Playback UI

When a user selects **Watch** or clicks a camera card:

- Open a player modal, side panel, or similarly compact viewing surface.
- Display the camera name and source/provider information.
- Provide a close action that returns the user to the map and route context.
- Show useful loading and playback-error states.
- Provide an **“Open original source”** link whenever a source URL is available.

For HLS playback, use a suitable browser player library such as `hls.js` when appropriate. Use native HLS playback where supported. Handle browsers that cannot play the selected format.

For embed playback, use the provider's intended public embed page where permitted. Respect the provider's embedding restrictions and browser security policies.

Do not assume every URL ending in `.m3u8` will play. CORS, authentication, token expiration, unsupported codecs, TLS, and provider restrictions may prevent playback.

### Public-feed restrictions

- Use only feeds and embed pages that are publicly accessible and permitted for this use.
- Do not bypass authentication, access controls, expiring tokens, or provider restrictions.
- Do not scrape private/admin endpoints.
- Do not assume that a public stream URL grants permission to redistribute it.
- Prefer stable public source URLs over copied, short-lived, tokenized playback URLs.
- Do not proxy or rebroadcast feeds through infrastructure you control.
- If direct playback is unavailable or disallowed, link to the original provider page instead.

The catalog should be maintainable by editing a static JSON file; no admin backend is required for the MVP.

## 8. Browser-First Architecture

Keep the architecture as simple as possible.

### Frontend

Use the existing project's stack if one exists. If this is a static site, prefer a lightweight implementation compatible with the current setup.

Responsibilities:

- Render the map and route geometry.
- Collect origin, destination, and waypoint inputs.
- Request geocoding and routing from external services.
- Load the static camera catalog.
- Calculate camera-to-route proximity in the browser.
- Rank and progressively reveal cameras.
- Display map markers and camera details.
- Play permitted streams or open provider pages.
- Preserve useful route state in the URL when practical.

Leaflet is a suitable map library if it is already used by the site. Reuse it rather than adding another mapping library without a concrete reason.

### External dependencies

The browser may call public services for:

- Geocoding
- Road routing
- Map tiles
- Camera playback

Choose providers based on their actual API capabilities, rate limits, CORS behavior, reliability, licensing, and terms of use. Do not assume a free public endpoint is suitable for unlimited production traffic.

A routing service that supports alternatives is required for the multi-route experience. If the selected provider does not support alternatives reliably, document the limitation and use another appropriate provider or gracefully fall back to a single route.

### Backend

**No custom backend is required for the MVP.**

Do not introduce a database, API server, queue, scheduled worker, or stream proxy unless a demonstrated requirement justifies it.

Browser-first does not mean dependency-free: geocoding, routing, tiles, and CCTV providers remain external dependencies. Handle rate limits, outages, and failed requests gracefully.

Do not embed secret API keys in frontend code. If a provider requires a secret credential that cannot safely be used in a browser, select a suitable public alternative or document that the provider requires a different architecture.

## 9. URL State and Sharing

Where practical, encode the journey in URL query parameters so a route can be bookmarked or shared.

For example:

`/cctv?from=...&to=...`

Use URL-safe coordinates or place identifiers as appropriate. Do not put secret credentials or short-lived stream tokens in the URL.

On page load, restore the journey if valid query parameters exist. If not, start in the normal empty state.

Keep `/map` URL handling independent from `/cctv`.

## 10. Loading, Errors, and Empty States

Implement explicit states for the following cases:

| State | Expected behavior |
|---|---|
| No route | Show instructions to enter origin and destination. |
| Geocoding in progress | Show a compact loading indicator. |
| Invalid location | Explain which input needs attention. |
| Route calculation in progress | Show loading feedback and prevent confusing duplicate submissions. |
| No alternative routes | Display the available route without implying an error. |
| Routing provider unavailable | Show a useful error and allow retrying. |
| No cameras in corridor | Explain that no matching cameras exist in the current catalog and search radius. |
| More cameras available | Show “Show more cameras.” |
| All cameras revealed | Display an end-of-results state. |
| Camera playback loading | Show a loading indicator. |
| Camera playback fails | Explain that the feed could not be played and offer the original source link if available. |
| Invalid camera record | Skip the record and continue loading valid cameras. |
| Map tile or external provider failure | Keep other functional parts usable where possible. |

Never claim that no physical CCTV cameras exist merely because the current catalog contains no matching records.

## 11. Performance and Reliability

- Keep the initial page load lightweight.
- Avoid loading all video players simultaneously.
- Instantiate the player only when the user opens a camera.
- Destroy or release player resources when the player closes or switches feeds.
- Debounce autocomplete requests.
- Avoid duplicate routing requests from repeated clicks.
- Cancel or ignore stale asynchronous responses when the user changes inputs.
- Avoid recalculating the full camera ranking unnecessarily.
- Cache results in memory for the current session where useful.
- Do not persist temporary playback tokens.
- Ensure a failed camera does not break the map, route, or other camera cards.

If the camera catalog grows significantly, optimize the spatial lookup before adding infrastructure.

## 12. Suggested Implementation Plan

Implement in small, verifiable steps.

### Phase 1 — Inspect and protect

1. Inspect the repository, build system, routing, current `/map` implementation, styles, and deployment configuration.
2. Identify reusable map utilities and existing components.
3. Confirm how `/cctv` can be deployed without changing `/map`.
4. Avoid broad refactors or unrelated cleanup.

### Phase 2 — Route planner

1. Create the standalone `/cctv` page.
2. Implement origin/destination inputs and validation.
3. Integrate geocoding and driving directions.
4. Display route geometry, distance, and duration.
5. Support route alternatives when available.
6. Add route selection and drawing animation.

### Phase 3 — Camera discovery

1. Add the static camera catalog and validation.
2. Implement camera-to-polyline distance calculations.
3. Filter and rank cameras by route relevance.
4. Display one initial recommendation.
5. Implement progressive reveal and deduplication.
6. Add camera markers and card/marker synchronization.

### Phase 4 — Playback

1. Implement the player modal or panel.
2. Support permitted HLS and embed playback.
3. Add the external source fallback.
4. Handle loading, playback errors, and resource cleanup.

### Phase 5 — Polish and verify

1. Match the existing site's visual language.
2. Add responsive desktop and mobile layouts.
3. Add shareable route URLs where practical.
4. Verify error and empty states.
5. Confirm that `/map` remains unchanged and functional.
6. Document external service assumptions and catalog maintenance.

Do not attempt to solve large-scale camera ingestion before the route-planning and discovery flow works end to end.

## 13. Acceptance Criteria

The MVP is complete when all applicable criteria pass:

- [ ] `/map` continues to work with its existing behavior.
- [ ] `/cctv` is a separate, functional page.
- [ ] Users can enter an origin and destination.
- [ ] Users can calculate a real driving route.
- [ ] Up to three actual route alternatives are shown when the provider returns them.
- [ ] The selected route is visually distinct and can be changed.
- [ ] Route changes update camera relevance and ordering.
- [ ] The selected route is drawn with a short, unobtrusive animation.
- [ ] Camera discovery uses real records from the camera catalog.
- [ ] Camera relevance is based on distance to the selected route geometry, not merely distance to the origin or destination.
- [ ] One camera is shown initially when a matching camera exists.
- [ ] “Show more cameras” reveals additional unique results progressively.
- [ ] Camera cards and map markers remain synchronized.
- [ ] Users can open supported public feeds or follow their original source links.
- [ ] Playback failure does not break route planning.
- [ ] Missing or invalid camera data is handled gracefully.
- [ ] Desktop and mobile layouts are usable.
- [ ] The implementation does not require a custom backend or stream proxy.
- [ ] No authentication, access control, or provider restriction is bypassed.
- [ ] The implementation follows the existing repository conventions and avoids unnecessary dependencies.

## 14. Out of Scope for the MVP

Do not implement these unless specifically requested later:

- User accounts or authentication
- Favorites synchronized across devices
- A database or custom backend
- Automated crawling of arbitrary CCTV websites
- Private/admin camera discovery
- Stream recording or rebroadcasting
- AI-based incident detection
- Traffic prediction based on CCTV
- Guaranteed real-time camera availability
- Guaranteed camera orientation toward a selected road
- A replacement or major redesign of Geoproximity

## 15. Final Product Direction

The product should feel like a lightweight route-planning companion, not a giant CCTV directory.

A user enters a journey, sees the real road route, gets one potentially relevant public camera, and can reveal more nearby cameras as needed.

**Product promise:** “Plan your route. Discover public cameras that might help you inspect the way ahead.”

Prioritize correctness, a clean map interface, progressive discovery, and reliable fallback behavior over the number of cameras shown.

