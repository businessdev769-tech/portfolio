"use client";

import { useSyncExternalStore } from "react";

// Shared client copy of the "open to opportunities" flag, so the header pill and the chat bot agree.
let open = true;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function setOpenStatus(value: boolean) {
  open = value;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) {
    loaded = true;
    fetch("/api/status", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ open: boolean }>)
      .then((data) => setOpenStatus(data.open))
      .catch(() => {});
  }
  return () => listeners.delete(listener);
}

export function useOpenStatus() {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => true,
  );
}

/** Non-hook read for event handlers (e.g. the bot building a reply). */
export function getOpenStatus() {
  return open;
}
