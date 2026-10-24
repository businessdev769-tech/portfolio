"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion, useInView } from "@/lib/hooks";

const GLYPHS = "0123456789<>/[]{}#*+=";

/** Text that "decodes" from noise into words, left to right, when it scrolls into view. */
export function DecodeText({ text, className = "" }: { text: string; className?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.4);
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    const start = performance.now();
    const duration = 900;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const settled = Math.floor(progress * text.length);
      setShown(
        text
          .split("")
          .map((ch, i) => (i < settled || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, text]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
