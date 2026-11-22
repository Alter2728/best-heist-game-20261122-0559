// Tools at a cost: a pocket of smoke bombs and decoy coins, both finite.
// Smoke breaks every sight line through it for a few seconds; a tossed coin
// clinks where it lands and pulls nearby guards off their routes.

import { SMOKE_COUNT, SMOKE_RADIUS, SMOKE_SECONDS, COIN_COUNT, COIN_RANGE } from "./config.js";

export function makeToolBelt() {
  return { smokeLeft: SMOKE_COUNT, coinsLeft: COIN_COUNT, smokes: [], coins: [] };
}

export function dropSmoke(belt, x, y) {
  if (belt.smokeLeft <= 0) return false;
  belt.smokeLeft -= 1;
  belt.smokes.push({ x, y, r: SMOKE_RADIUS, t: SMOKE_SECONDS });
  return true;
}

export function tossCoin(belt, fromX, fromY, aimX, aimY) {
  if (belt.coinsLeft <= 0) return null;
  const dx = aimX - fromX;
  const dy = aimY - fromY;
  const dist = Math.hypot(dx, dy) || 1;
  const reach = Math.min(dist, COIN_RANGE);
  const coin = { x: fromX + (dx / dist) * reach, y: fromY + (dy / dist) * reach, t: 2.2, heard: false };
  belt.coinsLeft -= 1;
  belt.coins.push(coin);
  return coin;
}

export function updateTools(belt, dt) {
  for (const s of belt.smokes) s.t -= dt;
  for (const c of belt.coins) c.t -= dt;
  belt.smokes = belt.smokes.filter((s) => s.t > 0);
  belt.coins = belt.coins.filter((c) => c.t > 0);
}

// Does any live smoke cloud sit on the sight line between two points?
export function smokeBlocksLine(belt, x1, y1, x2, y2) {
  for (const s of belt.smokes) {
    const vx = x2 - x1;
    const vy = y2 - y1;
    const len2 = vx * vx + vy * vy || 1;
    let t = ((s.x - x1) * vx + (s.y - y1) * vy) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = x1 + vx * t;
    const py = y1 + vy * t;
    if (Math.hypot(s.x - px, s.y - py) < s.r * 0.8) return true;
  }
  return false;
}
