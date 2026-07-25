// graph.js — build a routable node graph from OSM Overpass JSON.

import { haversine } from "./geo";

export function buildGraph(osm) {
  const nodes = new Map(); // id -> { id, lat, lon }
  const edges = new Map(); // id -> [{ to, weight }]

  for (const el of osm.elements) {
    if (el.type === "node") {
      nodes.set(el.id, {
        id: el.id,
        lat: el.lat,
        lon: el.lon,
      });
    }
  }

  const addEdge = (a, b, w) => {
    if (!edges.has(a)) {
      edges.set(a, []);
    }

    edges.get(a).push({
      to: b,
      weight: w,
    });
  };

  for (const el of osm.elements) {
    if (el.type !== "way" || !el.nodes || el.nodes.length < 2) {
      continue;
    }

    const oneway = el.tags?.oneway === "yes";

    for (let i = 0; i < el.nodes.length - 1; i++) {
      const a = el.nodes[i];
      const b = el.nodes[i + 1];

      const na = nodes.get(a);
      const nb = nodes.get(b);

      if (!na || !nb) {
        continue;
      }

      const w = haversine(
        [na.lat, na.lon],
        [nb.lat, nb.lon]
      );

      addEdge(a, b, w);

      if (!oneway) {
        addEdge(b, a, w);
      }
    }
  }

  // Drop nodes that no edge references (Overpass returns some strays)
  const referenced = new Set();

  for (const [a, list] of edges) {
    referenced.add(a);

    for (const { to } of list) {
      referenced.add(to);
    }
  }

  for (const id of Array.from(nodes.keys())) {
    if (!referenced.has(id)) {
      nodes.delete(id);
    }
  }

  return {
    nodes,
    edges,
  };
}

export function nearestNode(nodes, lat, lon) {
  let best = null;
  let bestD = Infinity;

  for (const n of nodes.values()) {
    const d = haversine([n.lat, n.lon], [lat, lon]);

    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }

  return best;
}