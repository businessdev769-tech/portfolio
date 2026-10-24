"use client";

import { useEffect, useRef } from "react";

/** Thin bar under the header that fills as the page is read — like generation progress. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const p = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-x-0 -bottom-px h-0.5">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-hot" />
    </div>
  );
}
