export default function Turns({ steps }) {
  if (!steps || steps.length === 0) {
    return (
      <div
        style={{
          padding: "1rem",
          color: "#868e96",
          fontStyle: "italic",
          fontSize: "0.85rem",
        }}
      >
        No route yet — pick a start and destination on the map.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "0.5rem 1rem",
        overflowY: "auto",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <h3
        style={{
          margin: "0.5rem 0",
          fontSize: "1rem",
        }}
      >
        Turn-by-turn
      </h3>

      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {steps.map((s, i) => (
          <li
            key={i}
            style={{
              padding: "0.55rem 0.6rem",
              borderBottom: "1px solid #f1f3f5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background:
                i === 0
                  ? "#d3f9d8"
                  : i === steps.length - 1
                  ? "#ffe0cc"
                  : "transparent",
              borderRadius:
                i === 0 || i === steps.length - 1 ? 4 : 0,
            }}
          >
            <span
              style={{
                fontSize: "0.88rem",
              }}
            >
              {s.text}
            </span>

            <span
              style={{
                color: "#868e96",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.8rem",
              }}
            >
              {s.distance_m > 0
                ? `${s.distance_m.toFixed(0)} m`
                : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}