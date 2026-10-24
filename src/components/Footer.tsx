import { profile } from "@/content/profile";

async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

export function Footer() {
  const links = [
    { label: "github", href: profile.links.github },
    { label: "linkedin", href: profile.links.linkedin },
    { label: "resume", href: profile.links.resume },
  ].filter((l) => l.href);

  return (
    <footer className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-4 border-t border-line px-6 pt-8 pb-12 font-mono text-[13px] text-muted">
      <span>
        &lt;|end of sequence|&gt; © <CurrentYear /> {profile.name} · {profile.location}
      </span>
      <span className="flex gap-6">
        {links.map((l) => (
          <a key={l.label} href={l.href} className="hover:text-attn">
            {l.label}
          </a>
        ))}
        <a href={`mailto:${profile.email}`} className="hover:text-attn">
          email
        </a>
      </span>
    </footer>
  );
}
