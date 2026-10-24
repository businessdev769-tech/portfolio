import { profile } from "@/content/profile";
import { rnd } from "@/lib/random";

const ITEMS = [...profile.mapSkills, ...profile.extraSkills].map((skill, i) => ({
  skill,
  id: 1000 + Math.floor(rnd(i * 7 + 3) * 49000),
}));

/** Endless strip of skills shown as tokens with ids. */
export function TokenTicker() {
  return (
    <div aria-hidden="true" className="group overflow-hidden bg-ink py-3.5 text-paper">
      <div className="ticker flex w-max gap-3 font-mono text-[13px] group-hover:[animation-play-state:paused]">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-2 rounded-md border border-night-line px-3 py-1">
            <span className="text-night-muted">{item.id}</span>
            <span>{item.skill}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
