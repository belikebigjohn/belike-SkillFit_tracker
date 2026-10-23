/** Weekly goal ring — dashoffset animates once on mount (small element, cheap paint). */
export default function GoalRing({
  pct,
  size = 132,
  stroke = 11,
  center,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  center: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));

  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} role="img" aria-label={`Недельная цель: ${clamped}%`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(255 255 255 / 0.07)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            filter: "drop-shadow(0 0 6px rgb(163 249 0 / 0.45))",
            transition: "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
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
