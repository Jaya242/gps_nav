// overpass.js — fetch OpenStreetMap road data around a point.

const OVERPASS_URL = '/overpass';

export async function fetchRoads(
  lat,
  lon,
  radiusMeters = 1500
) {
  const query = `
[out:json][timeout:25];
(
  way["highway"]
     ["highway"!~"footway|steps|path|cycleway|pedestrian|service|track"]
     (around:${radiusMeters},${lat},${lon});
);
(._;>;);
out body;
`;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
    },
    body: query,
  });

  if (!res.ok) {
    throw new Error(`Overpass returned ${res.status}`);
  }

  return res.json();
}