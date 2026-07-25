import { useState } from "react";

const PRESETS = [
  { name: "Bangalore (MG Road)", lat: 12.9756, lon: 77.6096 },
  { name: "Mumbai (CST)", lat: 18.9398, lon: 72.8355 },
  { name: "New Delhi (India Gate)", lat: 28.6129, lon: 77.2295 },
  { name: "San Francisco", lat: 37.7793, lon: -122.4193 },
  { name: "London (Trafalgar Sq)", lat: 51.508, lon: -0.1281 },
];

const btnBase = {
  padding: "0.6rem 0.9rem",
  border: "none",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.9rem",
};

const btnPrimary = {
  ...btnBase,
  background: "#1971c2",
  color: "#fff",
};

const btnSecondary = {
  ...btnBase,
  background: "#22a06b",
  color: "#fff",
};

const btnGhost = {
  ...btnBase,
  background: "#fff",
  color: "#495057",
  border: "1px solid #ced4da",
};

export default function Sidebar({
  status,
  info,
  onLoadArea,
  onUseGps,
  onReset,
  routeSummary,
}) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [radius, setRadius] = useState(1500);

  const preset = PRESETS[presetIdx];

  return (
    <div
      style={{
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.9rem",
        height: "100%",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <div>
        <h2
          style={{
            margin: "0 0 0.2rem",
            fontSize: "1.15rem",
          }}
        >
          GPS Route Planner
        </h2>

        <div
          style={{
            fontSize: "0.75rem",
            color: "#868e96",
          }}
        >
          OSM · Dijkstra · React Leaflet
        </div>
      </div>

      <div>
        <label
          style={{
            fontSize: "0.8rem",
            color: "#495057",
            display: "block",
            marginBottom: 4,
          }}
        >
          Area
        </label>

        <select
          value={presetIdx}
          onChange={(e) => setPresetIdx(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: 6,
            border: "1px solid #ced4da",
          }}
        >
          {PRESETS.map((p, i) => (
            <option key={i} value={i}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          style={{
            fontSize: "0.8rem",
            color: "#495057",
            display: "block",
            marginBottom: 4,
          }}
        >
          Radius: {radius} m
        </label>

        <input
          type="range"
          min="500"
          max="3000"
          step="100"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      <button
        onClick={() => onLoadArea(preset.lat, preset.lon, radius)}
        style={btnPrimary}
      >
        Load map
      </button>

      <button onClick={onUseGps} style={btnSecondary}>
        Use my location
      </button>

      <button onClick={onReset} style={btnGhost}>
        Reset start / end
      </button>

      <div
        style={{
          padding: "0.6rem 0.8rem",
          background: "#f1f3f5",
          borderRadius: 6,
          fontSize: "0.82rem",
        }}
      >
        <b>How to use</b>

        <ol
          style={{
            paddingLeft: "1.1rem",
            margin: "0.3rem 0 0",
          }}
        >
          <li>Pick an area, click Load map</li>
          <li>Click the map once — start (green)</li>
          <li>Click again — destination (orange)</li>
          <li>Route + turn-by-turn compute automatically</li>
        </ol>
      </div>

      <div
        style={{
          fontSize: "0.82rem",
        }}
      >
        <div
          style={{
            color: "#495057",
            marginBottom: 2,
          }}
        >
          Status
        </div>

        <div
          style={{
            padding: "0.4rem 0.7rem",
            borderRadius: 6,
            background:
              status?.tone === "error"
                ? "#ffe3e3"
                : status?.tone === "ok"
                ? "#d3f9d8"
                : "#e9ecef",
            color:
              status?.tone === "error"
                ? "#c92a2a"
                : status?.tone === "ok"
                ? "#2b8a3e"
                : "#495057",
          }}
        >
          {status?.text ?? "idle"}
        </div>
      </div>

      {info && (
        <div
          style={{
            fontSize: "0.82rem",
            color: "#495057",
          }}
        >
          <b>Graph:</b> {info.nodes} nodes, {info.edges} edges
        </div>
      )}

      {routeSummary && (
        <div
          style={{
            padding: "0.6rem 0.8rem",
            background: "#e7f5ff",
            borderRadius: 6,
            fontSize: "0.85rem",
          }}
        >
          <div>
            <b>Route</b>
          </div>

          <div>
            {(routeSummary.distance / 1000).toFixed(2)} km ·{" "}
            {routeSummary.stepCount} steps
          </div>
        </div>
      )}
    </div>
  );
}