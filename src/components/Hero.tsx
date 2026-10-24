"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { profile } from "@/content/profile";
import { prefersReducedMotion, useReducedMotion, useVisible, useWebGL } from "@/lib/hooks";
import { onLoaded } from "@/lib/loader";
import { rnd } from "@/lib/random";
import { InfoTip } from "./InfoTip";

const AttentionMatrix3D = dynamic(() => import("./three/AttentionMatrix3D"), { ssr: false });

const TOKENS = profile.headline;
const TINTS = ["bg-tint-1", "bg-tint-2", "bg-tint-3", "bg-tint-4", "bg-tint-5"];
// Tokens the attention matrix should "focus" on.
const SALIENT = new Set([" LLM", " agents", " RAG", " AI"]);

function attentionRow(i: number) {
  const raw = TOKENS.map((tok, j) =>
    j > i ? 0 : 0.2 + rnd(i * 13 + j) * 0.8 + (i === j ? 0.8 : 0) + (SALIENT.has(tok) ? 0.6 : 0),
  );
  const max = Math.max(...raw);
  return raw.map((w) => w / max);
}
const MATRIX = TOKENS.map((_, i) => attentionRow(i));

/** Flat fallback for devices without WebGL. */
function Matrix2D({ count }: { count: number }) {
  return (
    <div
      role="img"
      aria-label="Attention matrix that fills in row by row as the headline is generated"
      className="grid gap-1"
      style={{ gridTemplateColumns: `minmax(56px, auto) repeat(${TOKENS.length}, minmax(0, 1fr))` }}
    >
      {MATRIX.map((row, i) => (
        <div key={i} className="contents">
          <span className="truncate self-center pr-1.5 text-right font-mono text-[11px] leading-none text-muted">
            {TOKENS[i].trim() || "·"}
          </span>
          {row.map((w, j) => {
            if (j > i) return <span key={j} className="aspect-square rounded-[5px] border border-dashed border-line-strong" />;
            if (i >= count) return <span key={j} className="aspect-square rounded-[5px] bg-[#f0f0f3]" />;
            return (
              <span
                key={j}
                className="animate-cell-in aspect-square rounded-[5px]"
                style={{ backgroundColor: `rgb(43 59 255 / ${(0.08 + 0.92 * w).toFixed(2)})`, animationDelay: `${j * 35}ms` }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const [count, setCount] = useState(0);
  const [run, setRun] = useState(0);
  const [temp, setTemp] = useState(0);
  const [showTokens, setShowTokens] = useState(true);
  const webgl = useWebGL();
  const reduced = useReducedMotion();
  const [figureRef, figureVisible] = useVisible<HTMLDivElement>();

  // Stream the headline one token at a time, once the intro loader is gone.
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = onLoaded(() => {
      timer = setInterval(() => {
        setCount((n) => {
          if (prefersReducedMotion()) return TOKENS.length;
          if (n >= TOKENS.length) {
            clearInterval(timer);
            return n;
          }
          return n + 1;
        });
      }, 150);
    });
    return () => {
      stop();
      clearInterval(timer);
    };
  }, [run]);

  const regenerate = () => {
    setCount(0);
    setRun((r) => r + 1);
  };

  const t = temp / 100;
  const headline = TOKENS.join("");

  return (
    <section id="top" className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-14 px-6 pt-16 pb-28">
      <div className="min-w-0 flex-[1_1_600px]">
        <p className="mb-7 font-mono text-[15px] text-muted">&gt; prompt: &quot;Who is {profile.name}?&quot;</p>

        <h1 className="min-h-[3.2em] text-[clamp(42px,6vw,88px)] leading-[1.04] font-extrabold tracking-[-0.035em]">
          <span className="sr-only">{headline}</span>
          {TOKENS.map((token, ti) => (
            <span
              key={ti}
              aria-hidden="true"
              className={`inline-block rounded-lg whitespace-pre transition-colors duration-300 ${
                ti < count ? `animate-tok-in ${showTokens ? TINTS[ti % TINTS.length] : ""}` : "opacity-0"
              }`}
            >
              {token.split("").map((ch, li) => {
                const k = ti * 31 + li;
                const dx = (rnd(k) - 0.5) * 30 * t;
                const dy = (rnd(k + 7) - 0.5) * 44 * t;
                const rot = (rnd(k + 3) - 0.5) * 60 * t;
                const hot = t > 0.6 && rnd(k + 11) < (t - 0.6) * 0.5;
                return (
                  <span
                    key={li}
                    className={`inline-block whitespace-pre transition-[transform,color] duration-400 ease-[cubic-bezier(.2,.8,.2,1)] ${hot ? "text-hot" : ""}`}
                    style={{ transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)` }}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          ))}
          <span
            aria-hidden="true"
            className="animate-blink ml-[0.06em] inline-block h-[0.82em] w-[0.09em] bg-hot align-[-0.04em]"
          />
        </h1>

        <p className="mt-7 text-[19px] text-soft">
          {profile.role} · {profile.location} · currently {profile.currently}
        </p>

        <p className="mt-8 text-[15px] text-soft">
          Try it: this headline was written the way an AI writes. Play with it ↓
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3.5 font-mono text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <label htmlFor="temperature" className="inline-flex items-center gap-3">
              temperature
              <input
                id="temperature"
                type="range"
                min={0}
                max={200}
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-36 accent-hot sm:w-44"
              />
              <span className="min-w-9 text-ink">{t.toFixed(2)}</span>
            </label>
            <InfoTip label="temperature">
              <strong>How creative the AI is.</strong> At 0 it is calm and predictable. Drag right and it gets more
              random — watch the letters go wild.
            </InfoTip>
          </span>
          <span className="inline-flex items-center gap-2">
            <button
              type="button"
              aria-pressed={showTokens}
              onClick={() => setShowTokens((v) => !v)}
              className="min-h-11 rounded-lg border border-line-strong bg-white px-3.5 text-ink hover:border-ink"
            >
              tokens: {showTokens ? "on" : "off"}
            </button>
            <InfoTip label="a token">
              <strong>AI reads text in small pieces called tokens</strong> — a word or part of a word. Each colored box
              is one token. Switch off to hide the boxes.
            </InfoTip>
          </span>
          <span className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={regenerate}
              className="min-h-11 rounded-lg border border-line-strong bg-white px-3.5 text-ink hover:border-ink"
            >
              ↻ regenerate
            </button>
            <InfoTip label="regenerate" align="right">
              <strong>Write the headline again</strong>, one piece at a time — the same way ChatGPT types out its
              answers.
            </InfoTip>
          </span>
          <span>
            {count}/{TOKENS.length} tokens written
          </span>
        </div>

        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href="#work"
            className="inline-flex min-h-13 items-center gap-2.5 rounded-[10px] bg-ink px-6 font-semibold text-paper transition-transform hover:-translate-y-0.5"
          >
            See the attention map
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          {profile.links.resume && (
            <a
              href={profile.links.resume}
              className="inline-flex min-h-13 items-center rounded-[10px] border border-line-strong px-6 font-semibold hover:border-ink"
            >
              resume.pdf
            </a>
          )}
          <a
            href="#contact"
            className="inline-flex min-h-13 items-center rounded-[10px] border border-line-strong px-6 font-semibold hover:border-ink"
          >
            Contact me
          </a>
        </div>
      </div>

      <figure className="m-0 min-w-0 flex-[1_1_380px] rounded-2xl border border-line bg-white p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] leading-snug font-semibold">How the AI reads my headline</p>
            <p className="mt-0.5 font-mono text-xs text-muted">self-attention · causal mask · layer 12 / head 3</p>
          </div>
          <InfoTip label="this chart" align="right">
            <strong>Before writing each word, AI looks back at the words before it.</strong> Each row is one word of my
            headline. Taller, darker bars show which earlier words it paid the most attention to. It can only look
            back, never ahead — that&apos;s why half the grid stays flat.
          </InfoTip>
        </div>
        <div ref={figureRef}>
          {webgl ? (
            <div
              role="img"
              aria-label="3D attention matrix whose bars rise as each token of the headline is generated"
              className="aspect-square w-full"
            >
              <AttentionMatrix3D matrix={MATRIX} count={count} active={figureVisible} reduced={reduced} />
            </div>
          ) : (
            <div className="mt-2">
              <Matrix2D count={count} />
            </div>
          )}
        </div>
        <figcaption className="mt-2 text-sm text-muted">
          Each row rises as its word is written. Taller bars = the earlier words the AI focused on most.
        </figcaption>
      </figure>
    </section>
  );
}
