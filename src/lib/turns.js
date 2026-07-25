// turns.js — convert a route (array of {lat, lon}) into turn-by-turn steps.

import { bearing, haversine } from "./geo";

function turnLabel(delta) {
  const a = Math.abs(delta);

  if (a < 20) {
    return "Continue straight";
  }

  const side = delta > 0 ? "right" : "left";

  if (a < 45) {
    return `Slight ${side}`;
  }

  if (a < 135) {
    return `Turn ${side}`;
  }

  return `Sharp ${side}`;
}

function normalizedDelta(from, to) {
  let d = to - from;

  while (d > 180) {
    d -= 360;
  }

  while (d < -180) {
    d += 360;
  }

  return d;
}

export function buildInstructions(path) {
  if (!path || path.length < 2) {
    return [];
  }

  const steps = [];
  let cumulative = 0;

  steps.push({
    text: "Start",
    distance_m: 0,
    at: 0,
  });

  for (let i = 1; i < path.length - 1; i++) {
    const b1 = bearing(
      [path[i - 1].lat, path[i - 1].lon],
      [path[i].lat, path[i].lon]
    );

    const b2 = bearing(
      [path[i].lat, path[i].lon],
      [path[i + 1].lat, path[i + 1].lon]
    );

    cumulative += haversine(
      [path[i - 1].lat, path[i - 1].lon],
      [path[i].lat, path[i].lon]
    );

    const delta = normalizedDelta(b1, b2);

    if (Math.abs(delta) >= 20) {
      steps.push({
        text: turnLabel(delta),
        distance_m: cumulative - (steps[steps.length - 1].at ?? 0),
        at: cumulative,
      });
    }
  }

  let total = 0;

  for (let i = 1; i < path.length; i++) {
    total += haversine(
      [path[i - 1].lat, path[i - 1].lon],
      [path[i].lat, path[i].lon]
    );
  }

  steps.push({
    text: "Arrive at destination",
    distance_m: total - (steps[steps.length - 1].at ?? 0),
    at: total,
  });

  return steps;
}