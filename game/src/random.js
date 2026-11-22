// A tiny seeded random generator (mulberry32) so screenshot scenes and patrol
// jitter are reproducible: the same seed always stages the same frame.

export function makeRng(seed) {
  let state = (seed >>> 0) || 1;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngRange(rng, lo, hi) {
  return lo + rng() * (hi - lo);
}

export function rngPick(rng, items) {
  return items[Math.floor(rng() * items.length) % items.length];
}
