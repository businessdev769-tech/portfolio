"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { profile } from "@/content/profile";
import { useInView, useReducedMotion, useVisible, useWebGL } from "@/lib/hooks";
import { SectionHeading } from "./SectionHeading";

const LossLandscape3D = dynamic(() => import("./three/LossLandscape3D"), { ssr: false });

const STEPS = profile.journey;
// Where each checkpoint sits along the descent (0 = start, 1 = minimum).
const STOPS = STEPS.map((_, i) => (STEPS.length === 1 ? 0.9 : 0.14 + (i * 0.84) / (STEPS.length - 1)));

const W = 1120;
const H = 380;
// A noisy, descending "loss curve" — the flat fallback when WebGL is unavailable.
const CURVE: [number, number][] = [
  [40, 60], [80, 72], [120, 66], [160, 104], [200, 118], [220, 140], [260, 132], [300, 160], [340, 172],
  [380, 166], [420, 196], [460, 204], [500, 214], [560, 226], [600, 220], [640, 240], [700, 246],
  [760, 252], [820, 262], [860, 258], [900, 272], [960, 276], [1020, 284], [1080, 290],
];
const PATH = "M" + CURVE.map(([x, y]) => `${x} ${y}`).join(" L");

function yAt(x: number) {
  for (let i = 1; i < CURVE.length; i++) {
    const [x0, y0] = CURVE[i - 1];
    const [x1, y1] = CURVE[i];
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return CURVE[CURVE.length - 1][1];
}

function LossCurve2D({ selected, onSelect, drawn }: { selected: number; onSelect: (i: number) => void; drawn: boolean }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative mx-auto aspect-[1120/380] min-w-[680px]">
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="absolute inset-0 size-full">
          <path d="M40 100 H1080 M40 180 H1080 M40 260 H1080" stroke="var(--color-night-line)" strokeDasharray="4 6" fill="none" />
          <path d="M40 340 H1080" stroke="#3a3a44" fill="none" />
          {drawn && (
            <path
              d={PATH}
              pathLength={1}
              fill="none"
              stroke="var(--color-hot)"
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="animate-draw-slow"
            />
          )}
        </svg>
        {STEPS.map((s, i) => {
          const x = 160 + (i * (W - 380)) / Math.max(1, STEPS.length - 1);
          return (
            <button
              key={s.title}
              type="button"
              aria-label={`Checkpoint ${i + 1}: ${s.title}`}
              onClick={() => onSelect(i)}
              className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ left: `${(x / W) * 100}%`, top: `${(yAt(x) / H) * 100}%` }}
            >
              <span
                className={`block rounded-full border-[3px] border-hot ${selected === i ? "animate-pulse-ring size-5 bg-hot" : "size-3.5 bg-night"}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Journey() {
  const [selected, setSelected] = useState(STEPS.length - 1);
  const [startRef, started] = useInView<HTMLDivElement>(0.3);
  const [sceneRef, sceneVisible] = useVisible<HTMLDivElement>();
  const webgl = useWebGL();
  const reduced = useReducedMotion();
  const step = STEPS[selected];

  return (
    <section id="journey" className="scroll-mt-20 bg-night text-[#f3f3f5]">
      <div className="mx-auto max-w-[1240px] px-6 py-26">
        <SectionHeading
          dark
          index="04"
          label="training run"
          title="My journey, as gradient descent."
          aside="Every step of my education and career, plotted on a loss landscape. Pick a checkpoint and watch the ball roll there."
        />

        {/* Both observers sit on wrappers that exist before hydration, so they attach on first mount. */}
        <div ref={startRef}>
          <div ref={sceneRef}>
            {webgl ? (
              <div
                role="img"
                aria-label="3D loss landscape with a ball rolling downhill through each checkpoint of my journey"
                className="relative h-[360px] overflow-hidden rounded-2xl border border-night-line bg-[#101016] sm:h-[460px] md:h-[540px]"
              >
                <LossLandscape3D stops={STOPS} selected={selected} started={started} active={sceneVisible} reduced={reduced} />
                <span className="pointer-events-none absolute top-4 left-5 font-mono text-xs text-night-muted">
                  loss ≈ things I hadn&apos;t learned yet
                </span>
                <span className="pointer-events-none absolute right-5 bottom-4 font-mono text-xs text-night-muted">
                  gradient descent · {STEPS.length} checkpoints
                </span>
              </div>
            ) : (
              <LossCurve2D selected={selected} onSelect={setSelected} drawn={started} />
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              className={`min-h-11 rounded-xl border px-4 py-3 text-left transition-colors duration-300 ${
                selected === i ? "border-hot bg-hot/10" : "border-night-line hover:border-night-muted"
              }`}
            >
              <span className={`block font-mono text-xs ${selected === i ? "text-hot-text" : "text-night-muted"}`}>
                {String(i + 1).padStart(2, "0")} · {s.label}
              </span>
              <span className="mt-1 block text-[15px] leading-snug font-semibold">{s.title}</span>
            </button>
          ))}
        </div>

        <div
          key={selected}
          aria-live="polite"
          className="animate-pop-in mt-5 flex flex-wrap gap-x-14 gap-y-6 rounded-2xl border border-night-line p-6 sm:p-8"
        >
          <div className="flex-[1_1_280px]">
            <p className="mb-1.5 font-mono text-[13px] text-hot-text">
              checkpoint {selected + 1} · {step.kind} · {step.dates}
            </p>
            <p className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">{step.title}</p>
            <p className="mt-1.5 text-lg text-night-muted">{step.org}</p>
          </div>
          <div className="flex-[2_1_380px]">
            <ul className="flex list-disc flex-col gap-2 pl-5 text-[#d6d6dd]">
              {step.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p className="mt-4.5 font-mono text-[13px] text-night-muted">{step.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
