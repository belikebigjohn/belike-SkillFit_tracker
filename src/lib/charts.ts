/* Tiny SVG chart helpers — hand-drawn paths, no chart lib for module A.
   Recharts may replace these in module B if needed; keep signatures stable. */

export function formatNum(n: number): string {
  return n.toLocaleString("ru-RU");
}

/** Smooth (Catmull-Rom → cubic) path through points. */
export function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function toPoints(values: number[], w: number, h: number, padY = 6): Array<{ x: number; y: number }> {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: padY + (1 - (v - min) / span) * (h - padY * 2),
  }));
}
