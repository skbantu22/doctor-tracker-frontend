"use client";

import { useEffect, useRef, useState } from "react";

/** Animates a number from its previous value to `target`; jumps straight there when reduced motion is preferred. */
export function useCountUp(target: number | undefined, duration = 900) {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (target === undefined) return;
    const start = from.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || start === target) {
      from.current = target;
      const frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }
    const began = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(start + (target - start) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
