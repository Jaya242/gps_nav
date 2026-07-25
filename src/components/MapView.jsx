import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

function coloredIcon(color) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div
        style="
          width:22px;
          height:22px;
          border-radius:50%;
          background:${color};
          border:3px solid #fff;
          box-shadow:0 1px 4px rgba(0,0,0,0.4);
        "
      ></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function headingIcon(headingDeg = 0) {
  return L.divIcon({
    className: "heading-marker",
    html: `
      <div style="transform: rotate(${headingDeg}deg); width:34px; height:34px;">
        <svg viewBox="0 0 34 34" width="34" height="34">
          <circle
            cx="17"
            cy="17"
            r="11"
            fill="#1971c2"
            stroke="#fff"
            stroke-width="3"
          />
          <polygon
            points="17,3 24,16 17,12 10,16"
            fill="#fff"
          />
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function ClickCatcher({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

function Recenter({ target, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.setView(target, zoom ?? map.getZoom(), {
        animate: true,
      });
    }
  }, [map, target, zoom]);

  return null;
}

export default function MapView({
  initialCenter,
  recenterTo,
  start,
  end,
  gps,
  heading,
  routePoints,
  onMapClick,
}) {
  return (
    <MapContainer
      center={initialCenter}
      zoom={15}
      style={{
        height: "100%",
        width: "100%",
      }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickCatcher onMapClick={onMapClick} />
      <Recenter target={recenterTo} zoom={16} />

      {start && (
        <Marker
          position={[start.lat, start.lon]}
          icon={coloredIcon("#22a06b")}
        />
      )}

      {end && (
        <Marker
          position={[end.lat, end.lon]}
          icon={coloredIcon("#d9480f")}
        />
      )}

      {gps && (
        <Marker
          position={[gps.lat, gps.lon]}
          icon={headingIcon(heading ?? 0)}
        />
      )}

      {routePoints && routePoints.length > 1 && (
        <Polyline
          positions={routePoints.map((p) => [p.lat, p.lon])}
          pathOptions={{
            color: "#1971c2",
            weight: 6,
            opacity: 0.85,
          }}
        />
      )}
    </MapContainer>
  );
}