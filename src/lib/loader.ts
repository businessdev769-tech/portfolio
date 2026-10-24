// Shared between the intro loader and the hero, so the headline only starts streaming once the intro is gone.
export const loadState = { done: false };
export const LOADED_EVENT = "weights-loaded";

export function markLoaded() {
  loadState.done = true;
  window.dispatchEvent(new Event(LOADED_EVENT));
}

export function onLoaded(callback: () => void) {
  if (loadState.done) {
    callback();
    return () => {};
  }
  window.addEventListener(LOADED_EVENT, callback, { once: true });
  // Safety net in case the loader never mounts.
  const fallback = setTimeout(callback, 3000);
  return () => {
    window.removeEventListener(LOADED_EVENT, callback);
    clearTimeout(fallback);
  };
}
