"use client";

import { useEffect, useId, useRef, useState } from "react";

/** Small "i" button that explains a technical term in plain words. Hover on desktop, tap on phones. */
export function InfoTip({
  label,
  children,
  align = "left",
}: {
  label: string;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrapper = useRef<HTMLSpanElement>(null);

  // Close when tapping anywhere else (phones don't always blur buttons on tap).
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <span
      ref={wrapper}
      className="relative inline-flex"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      <button
        type="button"
        aria-label={`What is ${label}?`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className={`relative flex size-6 items-center justify-center rounded-full border font-mono text-xs font-medium transition-colors after:absolute after:-inset-2.5 after:content-[''] ${
          open ? "border-attn bg-attn text-white" : "border-line-strong bg-white text-muted hover:border-attn hover:text-attn"
        }`}
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`animate-pop-in absolute top-full z-30 mt-2.5 w-64 rounded-xl bg-night px-4 py-3 font-sans text-sm leading-snug tracking-normal text-[#f3f3f5] normal-case shadow-xl ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </span>
      )}
    </span>
  );
}
