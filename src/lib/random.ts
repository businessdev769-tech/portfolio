/** Deterministic pseudo-random number in [0, 1) — identical on server and client. */
export function rnd(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
