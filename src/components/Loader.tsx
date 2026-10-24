"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/hooks";
import { markLoaded } from "@/lib/loader";

const SHARDS = [
  "embeddings.safetensors",
  "attention.layers[0..11]",
  "mlp.layers[0..11]",
  "projects.ckpt",
  "experience.ckpt",
  "lm_head.bin",
];
const SEEN_KEY = "weights-loaded";

/** "Loading weights…" intro, shown once per browser session. */
export function Loader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">("loading");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    const duration = seen || prefersReducedMotion() ? 0 : 1400;
    const start = performance.now();
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = (now: number) => {
      const p = duration ? Math.min(1, (now - start) / duration) : 1;
      setProgress(p);
      if (p < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (duration === 0) {
        setPhase("done");
        markLoaded();
        return;
      }
      setPhase("leaving");
      timer = setTimeout(() => {
        setPhase("done");
        markLoaded();
      }, 550);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={`loader-failsafe fixed inset-0 z-50 flex items-center justify-center bg-night text-[#f3f3f5] transition-[opacity,transform] duration-500 ease-[cubic-bezier(.7,0,.3,1)] ${
        phase === "leaving" ? "-translate-y-full" : ""
      }`}
    >
      <div className="w-[min(440px,86vw)] font-mono text-[13px]">
        <p className="mb-5 text-night-muted">$ model.load(&quot;rajesh-r&quot;)</p>
        <div className="flex flex-col gap-1.5">
          {SHARDS.map((shard, i) => {
            const p = Math.min(1, Math.max(0, progress * SHARDS.length - i));
            return (
              <div key={shard} className={`flex justify-between gap-4 ${p > 0 ? "opacity-100" : "opacity-30"}`}>
                <span className="truncate">{shard}</span>
                <span className={p >= 1 ? "text-hot" : "text-night-muted"}>{p >= 1 ? "✓" : `${Math.round(p * 100)}%`}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-6 h-1 overflow-hidden rounded-full bg-night-line">
          <div className="h-full rounded-full bg-hot" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="mt-3 text-night-muted">{progress >= 1 ? "weights loaded · ready for inference" : "loading weights…"}</p>
      </div>
    </div>
  );
}
