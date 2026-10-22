import type { MuscleSlice } from "@/lib/types";

/** Muscle-group donut via SVG stroke segments. */
export default function MuscleDonut({
  slices,
  size = 148,
  stroke = 16,
  center,
}: {
  slices: MuscleSlice[];
  size?: number;
  stroke?: number;
  center: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = slices.reduce((s, m) => s + m.pct, 0) || 1;
  let acc = 0;

  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} role="img" aria-label="Распределение по группам мышц">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.05)" strokeWidth={stroke} />
        {slices.map((s) => {
          const frac = s.pct / total;
          const dash = `${(frac * c).toFixed(1)} ${(c - frac * c).toFixed(1)}`;
          const offset = -acc * c;
          acc += frac;
          return (
            <circle
              key={s.name}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={dash}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        {center}
      </div>
    </div>
  );
}
