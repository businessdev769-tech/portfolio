"use client";

import { useRef, useState } from "react";
import { setOpenStatus, useOpenStatus } from "@/lib/status";

const HOLD_MS = 700;

/**
 * "open to opportunities" pill. Hidden owner lock: long-press (phone) or triple-click (desktop)
 * opens a PIN prompt, then a switch that turns the status on or off for every visitor.
 */
export function StatusPill() {
  const open = useOpenStatus();
  const [lockOpen, setLockOpen] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const clicks = useRef<number[]>([]);

  const startHold = () => {
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setLockOpen(true), HOLD_MS);
  };
  const cancelHold = () => clearTimeout(holdTimer.current);
  const countClick = () => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 700), now];
    if (clicks.current.length >= 3) {
      clicks.current = [];
      setLockOpen(true);
    }
  };

  return (
    <>
      <span
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onClick={countClick}
        onContextMenu={(e) => e.preventDefault()}
        className="hidden cursor-default items-center gap-2 font-mono text-[13px] text-muted select-none [-webkit-touch-callout:none] sm:inline-flex"
      >
        <span className={`size-2 rounded-full ${open ? "animate-pulse-ring bg-hot" : "bg-[#a0a0ab]"}`} />
        {open ? "open to opportunities" : "busy building right now"}
      </span>
      {/* Phones: compact dot-only version so the header stays on one line. */}
      <span
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={open ? "Open to opportunities" : "Busy building right now"}
        className="inline-flex items-center gap-1.5 font-mono text-[12px] text-muted select-none [-webkit-touch-callout:none] sm:hidden"
      >
        <span className={`size-2 rounded-full ${open ? "animate-pulse-ring bg-hot" : "bg-[#a0a0ab]"}`} />
        {open ? "open to work" : "busy"}
      </span>
      {lockOpen && <OwnerLock open={open} onClose={() => setLockOpen(false)} />}
    </>
  );
}

function OwnerLock({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function call(body: { pin: string; open?: boolean }) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { open?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      if (typeof data.open === "boolean") setOpenStatus(data.open);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label="Owner settings" className="animate-pop-in w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-paper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              {unlocked ? <path d="M8 11V7a4 4 0 0 1 7.5-2" /> : <path d="M8 11V7a4 4 0 0 1 8 0v4" />}
            </svg>
          </span>
          <div>
            <p className="font-semibold">Owner settings</p>
            <p className="font-mono text-xs text-muted">{unlocked ? "unlocked" : "enter your PIN"}</p>
          </div>
        </div>

        {!unlocked ? (
          <form
            className="mt-5 flex flex-col gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await call({ pin })) setUnlocked(true);
            }}
          >
            <label htmlFor="owner-pin" className="sr-only">
              PIN
            </label>
            <input
              id="owner-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className="min-h-12 rounded-xl border border-line-strong bg-paper px-4 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-attn"
            />
            <button type="submit" disabled={busy || !pin} className="min-h-12 rounded-xl bg-ink font-semibold text-paper disabled:opacity-50">
              {busy ? "Checking…" : "Unlock"}
            </button>
          </form>
        ) : (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-line p-4">
            <div>
              <p className="font-medium">Open to opportunities</p>
              <p className="text-sm text-muted">Shown to every visitor and used by the chat bot.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={open}
              aria-label="Open to opportunities"
              disabled={busy}
              onClick={() => call({ pin, open: !open })}
              className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${open ? "bg-hot" : "bg-line-strong"} disabled:opacity-60`}
            >
              <span className={`absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform ${open ? "translate-x-6" : ""}`} />
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-3 text-sm text-[#b91c1c]">
            {error}
          </p>
        )}
        <button type="button" onClick={onClose} className="mt-4 min-h-11 w-full rounded-xl text-sm text-muted hover:bg-paper">
          Close
        </button>
      </div>
    </div>
  );
}
