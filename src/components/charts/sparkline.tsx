import { smoothPath, toPoints } from "@/lib/charts";

/** Inline sparkline. Width/height fixed; scales with viewBox. */
export default function Sparkline({
  values,
  width = 96,
  height = 34,
  color = "var(--accent)",
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const pts = toPoints(values, width, height, 4);
  const line = smoothPath(pts);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-hidden
    >
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
