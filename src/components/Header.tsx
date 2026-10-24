import { profile } from "@/content/profile";
import { ScrollProgress } from "./ScrollProgress";
import { StatusPill } from "./StatusPill";

const NAV = [
  { href: "#about", label: "about", tint: "bg-tint-1" },
  { href: "#work", label: "work", tint: "bg-tint-2" },
  { href: "#journey", label: "journey", tint: "bg-tint-3" },
  { href: "#contact", label: "contact", tint: "bg-tint-4" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <a href="#top" className="font-mono text-[15px] font-medium no-underline">
          {profile.handle}.forward()
        </a>
        <nav aria-label="Sections" className="flex flex-wrap gap-2 font-mono text-sm">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`${item.tint} rounded-md px-3 py-1.5 transition-transform hover:-translate-y-0.5`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <StatusPill />
      </div>
      <ScrollProgress />
    </header>
  );
}
