import { formatNum, smoothPath, toPoints } from "@/lib/charts";

/**
 * Area chart for weekly/monthly volume.
 * Static SVG (no JS per frame) — entrance is a CSS clip reveal via `rise`.
 */
export default function AreaChart({
  labels,
  values,
  height = 220,
}: {
  labels: string[];
  values: number[];
  height?: number;
}) {
  const w = 640;
  const h = height;
  const padY = 14;
  const pts = toPoints(values, w, h, padY);
  const line = smoothPath(pts);
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  const last = pts[pts.length - 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height }}
        role="img"
        aria-label={`Объём тренировок: от ${formatNum(values[0])} до ${formatNum(values[values.length - 1])} кг`}
      >
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={0}
            x2={w}
            y1={h * f}
            y2={h * f}
            stroke="rgb(255 255 255 / 0.05)"
            strokeWidth={1}
          />
        ))}
        <path d={area} fill="url(#area-fill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={last.x} cy={last.y} r={4} fill="var(--accent)" vectorEffect="non-scaling-stroke" />
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontSize: 11,
          color: "var(--muted-2)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}
