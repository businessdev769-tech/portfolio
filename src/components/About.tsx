"use client";

import Image from "next/image";
import { useState } from "react";
import { profile } from "@/content/profile";
import { rnd } from "@/lib/random";
import { Reveal } from "./Reveal";

// 8×10 patch grid over the photo; patches around the face get the most "attention".
const PATCHES = Array.from({ length: 80 }, (_, i) => {
  const col = i % 8;
  const row = Math.floor(i / 8);
  const face = row >= 1 && row <= 3 && col >= 3 && col <= 5;
  const weight = face ? 0.25 + rnd(i) * 0.3 : rnd(i) > 0.88 ? 0.12 : 0;
  return Math.round(weight * 100) / 100; // rounded so server and client markup match
});

function LogprobWord({ index, open, setOpen }: { index: number; open: boolean; setOpen: (i: number) => void }) {
  const alternatives = profile.bioWords[index];
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        onMouseEnter={() => setOpen(index)}
        onMouseLeave={() => setOpen(-1)}
        onFocus={() => setOpen(index)}
        onBlur={() => setOpen(-1)}
        onClick={() => setOpen(open ? -1 : index)}
        className={`cursor-help rounded-md px-1 text-attn underline decoration-dotted decoration-2 underline-offset-[6px] ${
          open ? "bg-attn/10" : ""
        }`}
      >
        {alternatives[0][0]}
      </button>
      {open && (
        <span className="animate-pop-in absolute top-full left-0 z-20 mt-2.5 flex w-72 flex-col gap-2 rounded-xl bg-night px-4 py-3.5 text-[#f3f3f5] shadow-xl">
          <span className="font-mono text-[11px] text-night-muted">next-token probabilities</span>
          {alternatives.map(([word, p], i) => (
            <span key={word} className="flex items-center gap-2.5 font-mono text-[13px] leading-tight">
              <span className="w-24 shrink-0">{word}</span>
              <span className="h-1.5 flex-1 rounded-full bg-night-line">
                <span
                  className={`block h-1.5 rounded-full ${i === 0 ? "bg-hot" : "bg-[#6b6b78]"}`}
                  style={{ width: `${Math.round(p * 100)}%` }}
                />
              </span>
              <span className="w-9 text-right">{p.toFixed(2)}</span>
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

export function About() {
  const [open, setOpen] = useState(-1);
  const [patches, setPatches] = useState(false);
  const parts = profile.bio.split(/\{(\d)\}/);

  return (
    <section id="about" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-start gap-14 px-6 py-26">
        <Reveal className="min-w-0 flex-[2_1_600px]">
          <p className="mb-7 font-mono text-sm text-muted">
            02 — about · hover the underlined words to see the alternatives I didn&apos;t pick
          </p>
          <p className="text-[clamp(28px,3.4vw,46px)] leading-[1.22] font-medium tracking-[-0.02em]">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <LogprobWord key={i} index={Number(part)} open={open === Number(part)} setOpen={setOpen} />
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </p>
          <p className="mt-8 max-w-2xl text-[19px] text-soft">{profile.summary}</p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {profile.facts.map((fact) => (
              <div
                key={fact.key}
                className="rounded-xl border border-line bg-white px-5 py-4.5 transition-[transform,border-color] hover:-translate-y-1 hover:border-attn"
              >
                <div className="mb-1.5 font-mono text-xs text-attn">{fact.key}</div>
                <div className="leading-snug font-semibold">{fact.value}</div>
                <div className="mt-1 text-sm text-muted">{fact.sub}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="w-full max-w-[380px] flex-[1_1_300px]">
          <figure className="m-0">
            <button
              type="button"
              aria-pressed={patches}
              aria-label="Toggle the vision-transformer patch view of the photo"
              onClick={() => setPatches((v) => !v)}
              className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-line bg-white"
            >
              <Image
                src={profile.photo.src}
                width={profile.photo.width}
                height={profile.photo.height}
                alt={`Portrait of ${profile.name}`}
                sizes="(max-width: 768px) 100vw, 380px"
                className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]"
                priority={false}
              />
              <div
                aria-hidden="true"
                className={`patch-grid pointer-events-none absolute inset-0 grid grid-cols-8 grid-rows-10 transition-opacity duration-500 ${
                  patches ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {PATCHES.map((weight, i) => (
                  <span
                    key={i}
                    className="bg-attn transition-opacity duration-700"
                    style={{ opacity: weight, transitionDelay: `${(i % 8) * 40 + Math.floor(i / 8) * 30}ms` }}
                  />
                ))}
              </div>
            </button>
            <figcaption className="mt-2.5 font-mono text-xs text-muted">
              input_image.jpeg · tap or hover to see it the way a vision transformer does
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
