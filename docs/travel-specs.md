# Jakarta → Bandung Travel Agent Visualizer — Feature Spec (MVP)

## 1. Problem

Choosing a Jakarta → Bandung travel agent (shuttle/travel service) should depend on where you're actually going once you arrive — e.g. Braga, Paskal, Dago, or Pasteur.

But booking platforms present drop-off points as flat text dropdowns with little or no spatial context. There's no easy way to see which agency's drop-off point is actually closest to your destination.

The tool makes the **destination** the starting point and lets users compare available drop-off points spatially.

## 2. Core Concept

Instead of asking:

> "Which travel agency should I use?"

the tool asks:

> **"Where are you going in Bandung?"**

Given a single destination, the tool displays all known travel-agent drop-off points on a map and ranks them by geographic distance.

**Input:** one destination in Bandung.

**Output:** a map of known drop-off points, connected visually to the destination, plus a ranked list ordered by distance.

The goal is not to make the decision automatically. The tool surfaces geographically convenient options so the user can inspect the map and choose the option that makes the most sense.

### MVP hypothesis

> Given a Bandung destination, showing travel-agent drop-off points spatially makes it easier to choose a convenient travel agent than comparing flat text drop-off lists.

Multi-stop itineraries and actual road travel time are deliberately deferred until this basic hypothesis is validated.

---

## 3. Data Model

```text
Agency
  - id
  - name
  - source_url

DropoffPoint
  - id
  - agency_id
  - raw_name              // e.g. "PASTEUR (POOL TRANSIT)"
  - normalized_name       // cleaned name for geocoding/dedup/reference
  - address?              // if available from source
  - lat
  - lng
  - geocoding_status      // auto | manually_verified | failed
  - last_verified_at?

ItineraryStop
  - name
  - lat
  - lng
```

`ItineraryStop` is user-provided and is not persisted server-side for MVP.

### Shared physical locations

Multiple agencies may use the same physical drop-off point.

No data-level deduplication is required for MVP. Each agency/drop-off relationship remains a separate record so the ranked list can show each agency independently.

If multiple records have identical coordinates, the frontend should handle marker collisions gracefully where practical. They may initially overlap; a later UI improvement can group/spiderfy them into a single physical location with multiple agency options.

---

## 4. Architecture: Fully Static, No Backend

The application is **client-side only** — a static site with a static JSON dataset and no runtime backend.

### Data

A generated static JSON file (`dropoffs.json`) contains all known drop-off points and is deployed alongside the frontend.

Example:

```json
{
  "last_updated": "2026-08-23",
  "dropoffs": [
    {
      "id": "jackal-pasteur",
      "agency_id": "jackal",
      "raw_name": "PASTEUR (POOL TRANSIT)",
      "normalized_name": "Pasteur Pool Transit",
      "address": "...",
      "lat": -6.89,
      "lng": 107.59,
      "geocoding_status": "manually_verified",
      "last_verified_at": "2026-08-20"
    }
  ]
}
```

### Refresh model

There is no automated daily scraper for MVP.

The dataset is regenerated manually whenever source data is re-pulled. Since physical pool/drop-off locations are relatively stable, manual refresh is sufficient initially.

The generated dataset contains a `last_updated` date, which the frontend displays as a data freshness disclaimer.

Automation through a GitHub Action or cron job can be added later if manual updates become inconvenient.

### Runtime

The frontend only needs to:

* load the static JSON
* render a map
* accept a destination coordinate
* calculate geographic distances
* sort results
* synchronize the map and ranked list

No backend or server-side API is required.

---

## 5. Data Pipeline

The pipeline runs offline before deployment.

```text
Agency websites
      ↓
   Scrapers
      ↓
Raw drop-off data
      ↓
Geocoding / manual verification
      ↓
dropoffs.json
      ↓
Static deployment
```

The generated JSON is the contract between the scraping/data-cleaning side and the frontend.

---

### 5.1 Scraper

Each agency gets a small adapter responsible for extracting available destination/drop-off labels.

Starting agencies:

* Jackal Holidays
* DayTrans
* Cititrans

For example, Jackal Holidays exposes destination information through its booking flow using parameters such as `asalKeberangkatan` / `tujuanKeberangkatan`, or equivalent dropdown/API responses.

Some agencies may also expose outlet detail pages containing:

* full street addresses
* outlet identifiers
* direct Google Maps links
* latitude/longitude information

When available, these are preferred over the booking-flow label alone because they provide better location data.

Each agency gets its own adapter because source layouts and APIs are expected to differ.

There is no requirement for a shared scraping implementation beyond producing the same output shape.

### Scraper output

The scraper first produces staging data such as:

```text
agency
raw_name
address?
map_link?
source_url
```

This staging data is then geocoded/verified before generating the final static dataset.

---

### 5.2 Geocoding

Geocoding happens **only during the offline data pipeline**.

The user-facing application does not geocode drop-off points at runtime.

Raw labels such as:

```text
PASTEUR (POOL TRANSIT)
BLORA
```

may not be sufficiently specific for reliable geocoding.

The pipeline should therefore:

1. Prefer full outlet addresses when available.
2. Add geographic context such as `Bandung, Indonesia` when necessary.
3. Prefer direct latitude/longitude from an agency's map link when available.
4. Use Nominatim for locations that still need geocoding.
5. Manually verify low-confidence or ambiguous results.

### Provider

**Nominatim / OpenStreetMap** is sufficient for MVP.

The scraper must respect the public service's usage policy, including its request-rate and identification requirements.

Because the dataset is small and the pipeline runs infrequently, this should not create significant load.

A paid geocoder can be considered later if Nominatim proves unreliable for particular agency locations.

### Verification

Rather than relying on a numeric geocoding confidence score, each point tracks a simple status:

```text
auto
manually_verified
failed
```

The important distinction is whether a location has been manually verified.

A small manual override file can be maintained for locations that the geocoder consistently gets wrong.

Given the expected dataset size, manually checking a few dozen locations is preferable to building complicated confidence logic.

---

### 5.3 Output

The pipeline generates a single static JSON file containing:

* dataset `last_updated`
* agency information
* drop-off information
* source information
* coordinates
* geocoding/verification status

The generated file is committed/deployed with the frontend.

The frontend never calls the scraper, geocoder, or agency websites.

---

## 6. Frontend

The interface is intentionally simple:

> **Where are you going in Bandung?**

The MVP is a **single-destination visualizer**, not an itinerary planner.

### Destination input

For MVP, the user provides the destination as latitude/longitude.

The intended flow is:

1. Find the destination in Google Maps.
2. Copy its coordinates.
3. Paste them into the tool.

Example:

```text
-6.9175, 107.6191
```

No runtime geocoding is required.

This deliberately minimizes infrastructure and allows the core visualization/ranking hypothesis to be validated first.

A destination text-search box can be added later to remove this friction.

### Jakarta origin

Jakarta is part of the product context — this is a Jakarta → Bandung travel tool — but the MVP does not need an origin input.

The origin does not affect the MVP calculation because the comparison is solely:

```text
drop-off point → Bandung destination
```

Pickup-point selection, travel time, and other origin-dependent factors can be added later.

---

## 7. Map

The map is the **primary decision surface**.

Use Leaflet with OpenStreetMap tiles.

The map displays:

* the user's destination as a distinct marker
* all known drop-off points as markers
* agency identity through marker styling/grouping
* the top-ranked drop-off as visually highlighted
* a connection/line from the destination to the selected drop-off when a point is inspected

Clicking a drop-off point shows:

```text
Agency
Drop-off name
Distance to destination
```

Every drop-off remains inspectable, not just the top-ranked result.

The user should be able to visually understand:

> "This agency drops me here, while that agency drops me over there."

The map is therefore more important than simply returning a ranked number.

---

## 8. Distance Calculation

MVP uses straight-line geographic distance using the Haversine formula.

```text
distance(dropoff, destination)
```

All calculations happen client-side.

The result is used for:

1. sorting the ranked list
2. displaying distance
3. highlighting the closest drop-off

This intentionally does **not** represent driving distance or travel time.

### Future routing

The distance implementation should be isolated behind a simple interface so the calculation can later be replaced with a routing provider such as OSRM.

Conceptually:

```text
distance(dropoff, destination)
```

can initially use:

```text
haversineDistance(...)
```

and later use:

```text
routeDistance(...)
```

without changing the rest of the product architecture.

---

## 9. Ranked Panel

A side panel lists all drop-off points sorted by distance to the destination.

Example:

```text
Closest drop-offs

1. Jackal Holidays
   Pasteur Pool Transit
   3.2 km

2. DayTrans
   Pasteur
   3.4 km

3. Cititrans
   Dago
   4.1 km
```

Clicking an item should focus/highlight the corresponding map node.

The ranking is a navigation and comparison aid, not an authoritative recommendation.

A slightly farther location may still be preferable because:

* it is near a recognizable landmark
* it is easier to reach
* it has a better pickup/drop-off arrangement
* the road access is better
* the user prefers that agency for another reason

The UI should therefore avoid presenting the closest point as universally "best."

---

## 10. Data Provenance

Every drop-off should retain enough source information to understand where its location came from.

At minimum:

```text
source_url
raw_name
```

When available, also preserve:

```text
address
map_link
```

This makes it possible to audit or correct the dataset when an agency changes its locations.

The generated dataset should be treated as a curated snapshot rather than an authoritative real-time representation of agency operations.

---

## 11. MVP Scope

### In scope

* Jakarta → Bandung context
* 3 agencies:

  * Jackal Holidays
  * DayTrans
  * Cititrans
* Manual one-off scraping
* Static generated JSON dataset
* Manual location verification where necessary
* Single Bandung destination
* User-provided latitude/longitude
* Leaflet + OpenStreetMap map
* All known drop-off points displayed
* Haversine straight-line distance
* Distance-ranked drop-off list
* Map/list interaction
* Top-ranked drop-off highlighting
* Dataset `last_updated` disclaimer
* Fully static/client-side deployment

### Out of scope

* Multi-stop itinerary support
* Real driving distance
* Travel-time estimates
* Routing APIs such as OSRM
* Departure schedules
* Pricing
* Availability
* Booking
* User accounts
* Saved itineraries
* Runtime scraping
* Runtime agency API calls
* Automated scraper scheduling
* Destination text search/geocoding
* Jakarta pickup-point optimization
* Public transit node context (see §12 — Nearby Public Transit Context)

---

## 12. Future Extensions

The MVP should leave room for, but not implement, the following:

### Destination search

Replace:

```text
lat, lng
```

with:

```text
Search Bandung destination
```

using a geocoding/search provider.

### Multi-stop itinerary

Allow:

```text
Braga → Paskal → Dago
```

and rank drop-off points based on proximity to the complete itinerary.

Possible ranking strategies can be evaluated later rather than prematurely defining one.

### Road distance / travel time

Replace straight-line distance with actual routing.

Potentially expose:

```text
distance
travel_time
```

instead of distance alone.

### Agency metadata

Add:

```text
price
departure_time
pickup_point
vehicle_type
```

to enable actual travel-agent comparisons.

### Automated data refresh

Move the offline scraper into a scheduled GitHub Action once manual refresh becomes tedious.

### Nearby public transit context

Given a coordinate — a drop-off point, or the user's Bandung destination — show nearby public transit nodes (train stations, bus stops/terminals) as additional spatial context, layered on the same map alongside agency drop-off points.

This generalizes the tool's spatial-comparison idea beyond travel-agent drop-offs to actual public transit infrastructure, e.g. surfacing that a given drop-off is a short walk from a Trans Metro Bandung stop.

```text
transitContext(coordinate, radius) → nearby train stations, bus stops/terminals
```

**Likely data source:** OpenStreetMap via the Overpass API, querying tags such as `railway=station`, `amenity=bus_station`, `highway=bus_stop` within a radius of the given coordinate. Consistent with the project's existing reliance on OSM (Nominatim) for geocoding.

**Open question — live query vs. pre-fetched dataset:**

* *Live, client-side Overpass query* — no pipeline changes needed, but reintroduces a runtime third-party dependency the MVP deliberately avoided for drop-off data, and the public Overpass instance can be rate-limited or slow.
* *Pre-fetched into the offline pipeline* — extend `generate-dataset.ts`-equivalent tooling to pull transit nodes for the Bandung area into the same static JSON contract used for drop-offs. More consistent with the project's "dumb runtime, offline pipeline" architecture, but requires defining a bounding box/area rather than a simple per-agency scrape.

No decision has been made yet on which approach to take, or on the radius/threshold for "nearby." A live query is likely the faster way to prototype and validate whether this is useful before committing to a pre-fetch pipeline.

---

## 13. Resolved Decisions

* **Starting agencies:** Jackal Holidays, DayTrans, Cititrans.
* **Application architecture:** fully static/client-side.
* **Runtime backend:** none.
* **Dataset:** generated static JSON committed/deployed with the frontend.
* **Scraping:** manual offline pipeline for MVP.
* **Geocoding:** Nominatim during the offline pipeline only.
* **User destination input:** latitude/longitude copied from Google Maps.
* **Origin input:** omitted from MVP UI; Jakarta is fixed as product context.
* **Distance:** Haversine straight-line distance.
* **Map:** Leaflet + OpenStreetMap.
* **Shared drop-off points:** no data-level deduplication.
* **Shared physical locations:** agency records remain separate; frontend may later group/spiderfy overlapping markers.
* **Location verification:** simple `auto` / `manually_verified` / `failed` status rather than relying on a numeric confidence score.
* **Decision-making:** ranking is advisory; the map remains the primary decision surface.
* **Multi-stop itinerary:** explicitly deferred.
* **Routing/travel time:** explicitly deferred.
* **Automated scraping:** explicitly deferred until manual refresh becomes a burden.
* **Public transit node context:** explicitly deferred; data source (live Overpass query vs. pre-fetched pipeline) not yet decided.

## 14. MVP Success Criteria

The MVP is successful if a user can:

1. Open the tool.
2. Paste a Bandung destination coordinate.
3. Immediately see nearby travel-agent drop-off points on a map.
4. Understand which agencies serve each location.
5. Compare the distances without manually looking up every agency's drop-off location.
6. Use the map to make a more informed agency choice.

The primary validation question is:

> **Does spatially comparing drop-off points make choosing a Jakarta → Bandung travel agent meaningfully easier?**

If yes, subsequent work can focus on removing input friction and improving the quality of the comparison rather than expanding the MVP prematurely.
