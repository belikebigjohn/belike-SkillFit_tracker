"use client";

import { useEffect, useRef, useState } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Segmented control with a sliding thumb.
 * The thumb is absolutely positioned and animates `transform` + `width` —
 * width only ever re-lays-out the thumb itself, never the page.
 */
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  const idx = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  useEffect(() => {
    const buttons = ref.current?.querySelectorAll<HTMLButtonElement>("button");
    const el = buttons?.[idx];
    if (el) setThumb({ x: el.offsetLeft, w: el.offsetWidth });
  }, [idx, options]);

  return (
    <div className="segmented" role="group" aria-label={ariaLabel} ref={ref}>
      <span
        className="thumb"
        aria-hidden
        style={{
          width: thumb?.w ?? 0,
          transform: `translateX(${thumb?.x ?? 0}px)`,
        }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
