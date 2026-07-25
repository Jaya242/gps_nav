# GPS Route Planner

A dynamic GPS-based navigation system that fetches real OpenStreetMap road data, builds a routable node graph, and computes the shortest path between two user-selected points using Dijkstra's algorithm.
Built with React, Vite, and Leaflet.

Submitted for **PS3 — GPS and Route Planning**.

---

## Features

### Core (required)

- **Node-based mapping** — road network is fetched live from OpenStreetMap and parsed into a directed graph of intersections (nodes) and street segments (edges).
- **Dynamic updates** — user can reload the map for any of several preset areas or their live GPS location, and the underlying graph rebuilds.
- **Optimized route planning** — shortest path between any two points on the loaded map, computed by Dijkstra's algorithm with haversine distance as edge weight.
- **Visual route display** — start / destination markers plus a highlighted polyline on the Leaflet map.

### Bonus

- **Real GPS from browser** — "Use my location" button reads the browser's Geolocation API and recentres the map on the user's actual position.
- **Turn-by-turn directions** — the route polyline is post-processed into human directions ("Turn left 240 m", "Slight right 55 m") based on bearing changes between consecutive segments.
- **Heading arrow** — the user marker is a compass icon that rotates using the `DeviceOrientation` API (works on mobile browsers; desktop shows a static north-up arrow).

---

## Architecture

```text
                 ┌──────────────────────┐
                 │   Browser (React)    │
                 │                      │
                 │ Sidebar   MapView    │
                 │         (Leaflet)    │
                 │ Turns     Markers    │
                 └──────────┬───────────┘
                            │
                  fetch /overpass      fetch tile.osm.org
                            │                  │
                            ▼                  ▼
                 ┌──────────────────┐   ┌─────────────────┐
                 │  Vite Dev Proxy  │   │   OSM Tile CDN  │
                 │  /overpass  -->  │   │  (map imagery)  │
                 │  Overpass API    │   └─────────────────┘
                 └──────────────────┘
                            │
                            ▼
                 ┌──────────────────┐
                 │  Overpass API    │
                 │   (OSM query)    │
                 └──────────────────┘
```

### Why the Vite proxy?

Overpass mirrors don't always send permissive CORS headers for every origin, so calling them directly from a GitHub Codespaces URL is blocked. `vite.config.js` proxies `/overpass` to the Overpass API, allowing the browser to fetch from the same origin.

---

## Algorithms

### 1. Graph construction (`src/lib/graph.js`)

Overpass returns a flat list of `node` and `way` elements.

We build:

- `nodes: Map<osmId, { id, lat, lon }>`
- `edges: Map<osmId, Array<{ to, weight }>>`

For each `way`, consecutive node pairs become graph edges. Unless `oneway=yes`, edges are added in both directions. Edge weights are computed using the haversine distance.

**Complexity:** `O(N + E)`

### 2. Nearest-node lookup (`src/lib/graph.js`)

User clicks are snapped to the nearest graph node using a linear scan.

**Complexity:** `O(N)`

### 3. Dijkstra (`src/lib/dijkstra.js`)

Shortest path is computed using a binary min-heap priority queue.

**Complexity:** `O((N + E) log N)`

### 4. Great-circle math (`src/lib/geo.js`)

- Haversine distance
- Bearing calculation

### 5. Turn generation (`src/lib/turns.js`)

Incoming and outgoing bearings determine turn instructions.

| Bearing Change | Instruction |
|---------------|-------------|
| <20° | Continue |
| 20–45° | Slight left/right |
| 45–135° | Turn left/right |
| >135° | Sharp left/right |

---

## File Structure

```text
gps_nav/
├── src/
│   ├── lib/
│   │   ├── geo.js
│   │   ├── overpass.js
│   │   ├── graph.js
│   │   ├── dijkstra.js
│   │   └── turns.js
│   ├── components/
│   │   ├── MapView.jsx
│   │   ├── Sidebar.jsx
│   │   └── Turns.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── vite.config.js
├── package.json
└── README.md
```

---

## Data Flow

1. User loads an area.
2. `fetchRoads()` downloads OSM data.
3. `buildGraph()` constructs the road graph.
4. User selects a start and destination.
5. `dijkstra()` computes the shortest path.
6. The route is drawn on the map and converted into turn-by-turn directions.

---

## Setup

```bash
git clone <repo>
cd gps_nav
npm install
npm run dev -- --host 0.0.0.0
```

---

## Usage

1. Choose an area.
2. Click **Load map**.
3. Click once to choose the start.
4. Click again to choose the destination.
5. The shortest path and directions appear automatically.

---

## Known Trade-offs

- Public Overpass servers may rate-limit requests.
- The `/overpass` proxy only exists during development.
- Turn instructions currently omit street names.
- Device orientation works mainly on mobile browsers.

---

## Future Improvements

- A* search
- Address search
- Street-name instructions
- Offline maps
- Route recording

---

## Tech Stack

- React 19
- Vite 8
- Leaflet
- React Leaflet
- OpenStreetMap
- Dijkstra (custom implementation)
- Geolocation API
- DeviceOrientation API
