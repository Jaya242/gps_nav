import { useCallback, useEffect, useMemo, useState } from "react";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import Turns from "./components/Turns";
import { fetchRoads } from "./lib/overpass";
import { buildGraph, nearestNode } from "./lib/graph";
import { dijkstra } from "./lib/dijkstra";
import { buildInstructions } from "./lib/turns";

const DEFAULT_CENTER = [12.9756, 77.6096]; // Bangalore MG Road

function countEdges(edges) {
  let n = 0;
  for (const list of edges.values()) n += list.length;
  return n;
}

export default function App() {
  const [initialCenter] = useState(DEFAULT_CENTER);
  const [recenterTo, setRecenterTo] = useState(null);

  const [graph, setGraph] = useState(null);
  const [status, setStatus] = useState({
    tone: "idle",
    text: "Pick an area and click Load map to begin.",
  });

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const [gps, setGps] = useState(null);
  const [heading, setHeading] = useState(null);

  const loadArea = useCallback(async (lat, lon, radius) => {
    setStatus({
      tone: "idle",
      text: `Loading roads around (${lat.toFixed(4)}, ${lon.toFixed(
        4
      )}) …`,
    });

    try {
      const osm = await fetchRoads(lat, lon, radius);
      const g = buildGraph(osm);

      if (g.nodes.size === 0) {
        setStatus({
          tone: "error",
          text: "No roads found in this area.",
        });
        return;
      }

      setGraph(g);
      setStart(null);
      setEnd(null);
      setRecenterTo([lat, lon]);

      setStatus({
        tone: "ok",
        text: `Loaded ${g.nodes.size} nodes, ${countEdges(
          g.edges
        )} edges. Click map to set start.`,
      });
    } catch (e) {
      console.error(e);
      setStatus({
        tone: "error",
        text: `Failed: ${e.message}`,
      });
    }
  }, []);

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus({
        tone: "error",
        text: "Geolocation not available in this browser",
      });
      return;
    }

    setStatus({
      tone: "idle",
      text: "Requesting location …",
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        setGps({
          lat: latitude,
          lon: longitude,
        });

        setRecenterTo([latitude, longitude]);
        loadArea(latitude, longitude, 1500);
      },
      (err) =>
        setStatus({
          tone: "error",
          text: `Location denied: ${err.message}`,
        }),
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, [loadArea]);

  useEffect(() => {
    const handler = (e) => {
      if (typeof e.alpha === "number") {
        setHeading(360 - e.alpha);
      }
    };

    window.addEventListener(
      "deviceorientationabsolute",
      handler,
      true
    );
    window.addEventListener("deviceorientation", handler, true);

    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handler,
        true
      );
      window.removeEventListener(
        "deviceorientation",
        handler,
        true
      );
    };
  }, []);

  const handleMapClick = useCallback(
    (lat, lon) => {
      if (!graph) {
        setStatus({
          tone: "error",
          text: "Load a map first.",
        });
        return;
      }

      if (!start || (start && end)) {
        setStart({ lat, lon });
        setEnd(null);

        setStatus({
          tone: "idle",
          text: "Start set. Click again for destination.",
        });
      } else {
        setEnd({ lat, lon });

        setStatus({
          tone: "ok",
          text: "Destination set — computing route…",
        });
      }
    },
    [graph, start, end]
  );

  const resetPoints = useCallback(() => {
    setStart(null);
    setEnd(null);

    setStatus({
      tone: "idle",
      text: "Start / end cleared.",
    });
  }, []);

  const route = useMemo(() => {
    if (!graph || !start || !end) return null;

    const sn = nearestNode(graph.nodes, start.lat, start.lon);
    const en = nearestNode(graph.nodes, end.lat, end.lon);

    if (!sn || !en) return null;

    const res = dijkstra(graph.edges, sn.id, en.id);

    if (!res) return null;

    const points = res.path.map((id) => {
      const n = graph.nodes.get(id);
      return {
        lat: n.lat,
        lon: n.lon,
      };
    });

    return {
      points,
      distance: res.distance,
    };
  }, [graph, start, end]);

  const instructions = useMemo(
    () => (route ? buildInstructions(route.points) : []),
    [route]
  );

  const routeSummary = route
    ? {
        distance: route.distance,
        stepCount: instructions.length,
      }
    : null;

  return (
    <div className="app-root">
      <aside className="sidebar">
        <Sidebar
          status={status}
          info={
            graph
              ? {
                  nodes: graph.nodes.size,
                  edges: countEdges(graph.edges),
                }
              : null
          }
          onLoadArea={loadArea}
          onUseGps={useMyLocation}
          onReset={resetPoints}
          routeSummary={routeSummary}
        />
      </aside>

      <main className="map-area">
        <MapView
          initialCenter={initialCenter}
          recenterTo={recenterTo}
          start={start}
          end={end}
          gps={gps}
          heading={heading}
          routePoints={route?.points}
          onMapClick={handleMapClick}
        />
      </main>

      <section className="turns-area">
        <Turns steps={instructions} />
      </section>
    </div>
  );
}