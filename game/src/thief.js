// The thief: keyboard movement with a sneak modifier, and the slow,
// exposed work of hands — lifting loot from a case and picking the vault
// lock both take time standing still, which is where the tension lives.

import {
  THIEF_SPEED, THIEF_SNEAK_SPEED, THIEF_RADIUS, LOCKPICK_SECONDS,
} from "./config.js";
import { moveCircle, pointInRect, VAULT_DOOR } from "./world.js";

export function makeThief(start) {
  return {
    x: start.x, y: start.y,
    radius: THIEF_RADIUS,
    facing: -Math.PI / 2,
    moving: false,
    sneaking: false,
    channel: null, // { kind: "loot" | "lock", target, t, needed }
    haul: 0,
    pieces: 0,
  };
}

export function updateThief(thief, dt, keys, vaultOpen) {
  let dx = 0;
  let dy = 0;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;
  thief.sneaking = keys.sneak;
  thief.moving = dx !== 0 || dy !== 0;
  if (thief.moving) {
    const len = Math.hypot(dx, dy);
    const speed = thief.sneaking ? THIEF_SNEAK_SPEED : THIEF_SPEED;
    const moved = moveCircle(
      thief, (dx / len) * speed * dt, (dy / len) * speed * dt,
      thief.radius, vaultOpen,
    );
    thief.x = moved.x;
    thief.y = moved.y;
    thief.facing = Math.atan2(dy, dx);
    thief.channel = null; // moving breaks any hands-on work
  }
}

// What the E key would work on right now: nearest untaken loot within reach,
// or the vault door while it is still locked.
export function interactTarget(thief, loot, vaultOpen) {
  let best = null;
  let bestDist = 34;
  for (const item of loot) {
    if (item.taken) continue;
    const d = Math.hypot(item.x - thief.x, item.y - thief.y);
    if (d < bestDist) {
      best = { kind: "loot", target: item, needed: item.big ? 1.6 : 0.9 };
      bestDist = d;
    }
  }
  if (!vaultOpen) {
    const cx = VAULT_DOOR.x + VAULT_DOOR.w / 2;
    const cy = VAULT_DOOR.y + VAULT_DOOR.h / 2;
    if (Math.hypot(cx - thief.x, cy - thief.y) < 40) {
      best = { kind: "lock", target: VAULT_DOOR, needed: LOCKPICK_SECONDS };
    }
  }
  return best;
}

// Advance a channel while E is held. Returns "done" on the finishing frame.
export function updateChannel(thief, dt, held, target) {
  if (!held || !target) {
    thief.channel = null;
    return null;
  }
  if (!thief.channel || thief.channel.target !== target.target) {
    thief.channel = { kind: target.kind, target: target.target, t: 0, needed: target.needed };
  }
  thief.channel.t += dt;
  if (thief.channel.t >= thief.channel.needed) {
    const done = thief.channel;
    thief.channel = null;
    return done;
  }
  return null;
}

export function takeLoot(thief, item) {
  item.taken = true;
  thief.haul += item.value;
  thief.pieces += 1;
}

export function atExit(thief, exit) {
  return pointInRect(thief.x, thief.y, exit);
}
