"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const SKILLS = profile.mapSkills;
const PROJECTS = profile.projects;
const LINKS = PROJECTS.flatMap((project, p) =>
  project.uses.map(([skill, weight]) => ({ p, s: SKILLS.indexOf(skill), weight })),
).filter((link) => link.s >= 0);

type Edge = { d: string; p: number; s: number; weight: number };

// 3D tilt that follows the mouse (skipped for touch).
function tilt(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  e.currentTarget.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
}

function untilt(e: React.PointerEvent<HTMLElement>) {
  e.currentTarget.style.transform = "";
}

export function AttentionMap() {
  const [hoverSkill, setHoverSkill] = useState(-1);
  const [hoverProject, setHoverProject] = useState(-1);
  const [edges, setEdges] = useState<Edge[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const skillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const projectRefs = useRef<(HTMLElement | null)[]>([]);

  // Measure the layout and draw a curve from each skill to each project that used it.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const origin = box.getBoundingClientRect();
      const next: Edge[] = [];
      for (const link of LINKS) {
        const a = skillRefs.current[link.s]?.getBoundingClientRect();
        const b = projectRefs.current[link.p]?.getBoundingClientRect();
        if (!a || !b || b.left < a.right) continue; // stacked (mobile) layout: no curves
        const x1 = a.right - origin.left;
        const y1 = a.top + a.height / 2 - origin.top;
        const x2 = b.left - origin.left;
        const y2 = b.top + b.height / 2 - origin.top;
        const mid = (x1 + x2) / 2;
        next.push({ ...link, d: `M${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}` });
      }
      setEdges(next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const anyHover = hoverSkill >= 0 || hoverProject >= 0;
  const skillActive = (s: number) =>
    hoverSkill === s || (hoverProject >= 0 && LINKS.some((l) => l.p === hoverProject && l.s === s));
  const clear = () => {
    setHoverSkill(-1);
    setHoverProject(-1);
  };

  return (
    <section id="work" className="scroll-mt-20 border-t border-line bg-white">
      <div className="mx-auto max-w-[1240px] px-6 py-26">
        <SectionHeading
          index="03"
          label="work"
          title="An attention map of what I know and where I used it."
          aside="Hover a skill to see which projects attend to it — or hover a project to see what it was built from."
        />

        <Reveal>
          <div ref={boxRef} className="relative grid gap-10 md:grid-cols-[minmax(220px,280px)_1fr] md:gap-[clamp(80px,18vw,260px)]">
            <svg aria-hidden="true" className="pointer-events-none absolute inset-0 hidden size-full overflow-visible md:block">
              {edges.map((edge, i) => {
                const on = hoverSkill === edge.s || hoverProject === edge.p;
                return on ? (
                  <path
                    key={`${i}-on-${hoverSkill}-${hoverProject}`}
                    d={edge.d}
                    pathLength={1}
                    fill="none"
                    stroke="var(--color-attn)"
                    strokeWidth={1 + 3 * edge.weight}
                    strokeLinecap="round"
                    className="animate-draw"
                  />
                ) : (
                  <path
                    key={i}
                    d={edge.d}
                    fill="none"
                    stroke="var(--color-ink)"
                    strokeWidth={1}
                    className="transition-opacity duration-300"
                    opacity={anyHover ? 0.06 : 0.16}
                  />
                );
              })}
            </svg>

            <div className="relative flex flex-wrap gap-2.5 md:flex-col md:justify-between">
              {SKILLS.map((skill, s) => {
                const active = skillActive(s);
                return (
                  <button
                    key={skill}
                    ref={(el) => {
                      skillRefs.current[s] = el;
                    }}
                    type="button"
                    onMouseEnter={() => {
                      setHoverSkill(s);
                      setHoverProject(-1);
                    }}
                    onFocus={() => {
                      setHoverSkill(s);
                      setHoverProject(-1);
                    }}
                    onClick={() => setHoverSkill(hoverSkill === s ? -1 : s)}
                    onMouseLeave={clear}
                    onBlur={clear}
                    className={`flex min-h-11 items-center justify-between gap-4 rounded-[10px] border px-4 text-[17px] font-semibold transition-all duration-250 md:w-full ${
                      active ? "border-attn bg-attn text-white" : "border-line-strong bg-white text-ink"
                    } ${anyHover && !active ? "opacity-45" : ""}`}
                  >
                    {skill}
                    <span className="font-mono text-xs opacity-70">×{LINKS.filter((l) => l.s === s).length}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative flex flex-col justify-between gap-5">
              {PROJECTS.map((project, p) => {
                const link = LINKS.find((l) => l.p === p && l.s === hoverSkill);
                const active = hoverProject === p || !!link;
                return (
                  <article
                    key={project.name}
                    ref={(el) => {
                      projectRefs.current[p] = el;
                    }}
                    tabIndex={0}
                    onMouseEnter={() => {
                      setHoverProject(p);
                      setHoverSkill(-1);
                    }}
                    onFocus={() => {
                      setHoverProject(p);
                      setHoverSkill(-1);
                    }}
                    onMouseLeave={clear}
                    onBlur={clear}
                    onPointerMove={tilt}
                    onPointerLeave={untilt}
                    className={`rounded-2xl border bg-white p-6 transition-[opacity,border-color,box-shadow,translate,transform] duration-300 ${
                      active ? "border-attn shadow-[0_0_0_1px_var(--color-attn)] md:-translate-x-1.5" : "border-line-strong"
                    } ${anyHover && !active ? "opacity-45" : ""}`}
                  >
                    <div className={`flex justify-between gap-3 font-mono text-xs ${active ? "text-attn" : "text-muted"}`}>
                      <span>{project.tag}</span>
                      <span>{link ? `attn ${link.weight.toFixed(2)}` : ""}</span>
                    </div>
                    <h3 className="mt-1.5 text-[24px] font-semibold tracking-[-0.01em]">{project.name}</h3>
                    <p className="mt-1.5 text-[15px] leading-normal text-soft">{project.description}</p>
                    <div
                      className={`grid overflow-hidden text-[15px] text-soft transition-[grid-template-rows,margin] duration-500 ${
                        hoverProject === p ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <ul className="min-h-0 list-disc pl-5">
                        {project.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    {project.links && project.links.length > 0 && (
                      <div className="mt-3 flex gap-5 text-sm font-medium">
                        {project.links.map((l) => (
                          <a key={l.href} href={l.href} className="underline underline-offset-4 hover:text-attn">
                            {l.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div className="mt-12 flex flex-wrap items-center gap-2">
          <span className="mr-2 font-mono text-[13px] text-muted">also in my context window:</span>
          {profile.extraSkills.map((skill) => (
            <span key={skill} className="rounded-lg bg-[#f2f2f4] px-3 py-1.5 font-mono text-[13px]">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
