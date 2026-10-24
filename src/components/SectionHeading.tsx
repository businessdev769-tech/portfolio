import { DecodeText } from "./DecodeText";

export function SectionHeading({
  index,
  label,
  title,
  aside,
  dark = false,
}: {
  index: string;
  label: string;
  title: string;
  aside?: string;
  dark?: boolean;
}) {
  return (
    <>
      <p className={`mb-3 font-mono text-sm ${dark ? "text-night-muted" : "text-muted"}`}>
        {index} — {label}
      </p>
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <h2 className="max-w-3xl text-[clamp(36px,4.4vw,60px)] font-bold leading-[1.05] tracking-[-0.03em]">
          <DecodeText text={title} />
        </h2>
        {aside && <p className={`max-w-sm text-base ${dark ? "text-night-muted" : "text-soft"}`}>{aside}</p>}
      </div>
    </>
  );
}
