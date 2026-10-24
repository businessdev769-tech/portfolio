"use client";

import { useState } from "react";
import { profile } from "@/content/profile";
import { SectionHeading } from "./SectionHeading";

export function Contact() {
  const [message, setMessage] = useState("");
  const mailto =
    `mailto:${profile.email}?subject=${encodeURIComponent("Hello from your portfolio")}` +
    `&body=${encodeURIComponent(message)}`;

  return (
    <section id="contact" className="scroll-mt-20">
      <div className="mx-auto max-w-[1240px] px-6 pt-28 pb-20">
        <SectionHeading index="05" label="contact" title="Start a new conversation." />

        <div className="max-w-[860px] rounded-[18px] border border-line-strong bg-white p-5 transition-shadow focus-within:shadow-[0_0_0_3px_var(--color-tint-2)]">
          <label htmlFor="message" className="mb-2 block font-mono text-[13px] text-muted">
            your message to {profile.firstName.toLowerCase()}
          </label>
          <textarea
            id="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Say hi, pitch a project, or ask me anything…"
            className="w-full resize-y border-0 bg-transparent text-[22px] text-ink outline-none placeholder:text-[#8a8a95]"
          />
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap gap-2">
              {profile.contactChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setMessage(`${chip} — `)}
                  className="min-h-11 rounded-full border border-line-strong bg-paper px-3.5 font-mono text-[13px] hover:border-ink"
                >
                  {chip}
                </button>
              ))}
            </div>
            <a
              href={mailto}
              className="inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-hot px-5.5 font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Send
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>
        <p className="mt-6 text-base text-soft">
          Or write directly:{" "}
          <a href={`mailto:${profile.email}`} className="underline underline-offset-4 hover:text-attn">
            {profile.email}
          </a>
        </p>
      </div>
    </section>
  );
}
