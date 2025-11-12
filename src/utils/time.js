js/* Time helpers including a tiny deterministic RNG for mock generation */
function toUnixSeconds(msOrDate) {
  const ms = msOrDate instanceof Date ? msOrDate.getTime() : Number(msOrDate);
  return Math.floor(ms / 1000);
}

// Mulberry32-like deterministic PRNG seeded by string hash
function seededRngFrom(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  let state = h >>> 0;
  return function rng() {
    // xorshift
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

module.exports = { toUnixSeconds, seededRngFrom };