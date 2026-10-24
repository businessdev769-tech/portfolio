"use client";

import { useInView } from "@/lib/hooks";

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.12);
  return (
    <div ref={ref} className={`reveal ${inView ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
