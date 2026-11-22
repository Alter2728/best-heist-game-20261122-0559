// Guards: waypoint patrols with pauses, a vision cone each, ears for decoy
// coins, and a short chase when the alarm is screaming. A guard who hears a
// coin walks to it, looks around, then returns to the route.

import {
  GUARD_SPEED, GUARD_CHASE_SPEED, GUARD_RADIUS,
  GUARD_VIEW_DIST, GUARD_VIEW_HALF_ANGLE, COIN_HEAR_RADIUS,
} from "./config.js";
import { moveCircle, lineOfSight, angleDiff } from "./world.js";

export function makeGuard(spec) {
  const [x, y] = spec.route[0];
  return {
    x, y,
    route: spec.route,
    pause: spec.pause,
    target: 1 % spec.route.length,
    wait: 0,
    facing: Math.PI / 2,
    mode: "patrol", // patrol | investigate | look | chase
    tx: x, ty: y,
    lookTime: 0,
    seesThief: false,
    radius: GUARD_RADIUS,
  };
}

export function guardSees(guard, thief, vaultOpen, smokeBlocks) {
  const dx = thief.x - guard.x;
  const dy = thief.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > GUARD_VIEW_DIST) return 0;
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, guard.facing)) > GUARD_VIEW_HALF_ANGLE) return 0;
  if (!lineOfSight(guard.x, guard.y, thief.x, thief.y, vaultOpen)) return 0;
  if (smokeBlocks(guard.x, guard.y, thief.x, thief.y)) return 0;
  // Strength 0..1: closer is stronger, sneaking blunts it.
  let strength = 1 - dist / GUARD_VIEW_DIST;
  if (thief.sneaking) strength *= 0.45;
  if (!thief.moving) strength *= 0.7;
  return Math.max(0.08, strength);
}

export function guardHearsCoin(guard, coin) {
  const dist = Math.hypot(coin.x - guard.x, coin.y - guard.y);
  if (dist > COIN_HEAR_RADIUS) return false;
  guard.mode = "investigate";
  guard.tx = coin.x;
  guard.ty = coin.y;
  guard.wait = 0;
  return true;
}

function walkToward(guard, tx, ty, speed, dt, vaultOpen) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) return true;
  const step = Math.min(dist, speed * dt);
  const moved = moveCircle(
    guard, (dx / dist) * step, (dy / dist) * step, guard.radius, vaultOpen,
  );
  guard.x = moved.x;
  guard.y = moved.y;
  guard.facing = Math.atan2(dy, dx);
  return Math.hypot(tx - guard.x, ty - guard.y) < 6;
}

export function updateGuard(guard, dt, thief, vaultOpen, alarmHot) {
  if (alarmHot && guard.seesThief) guard.mode = "chase";
  if (guard.mode === "chase") {
    walkToward(guard, thief.x, thief.y, GUARD_CHASE_SPEED, dt, vaultOpen);
    if (!guard.seesThief && !alarmHot) guard.mode = "patrol";
    return;
  }
  if (guard.mode === "investigate") {
    if (walkToward(guard, guard.tx, guard.ty, GUARD_SPEED * 1.25, dt, vaultOpen)) {
      guard.mode = "look";
      guard.lookTime = 1.6;
    }
    return;
  }
  if (guard.mode === "look") {
    guard.facing += Math.sin(guard.lookTime * 4) * dt * 1.8;
    guard.lookTime -= dt;
    if (guard.lookTime <= 0) guard.mode = "patrol";
    return;
  }
  // Patrol: walk the loop, pausing at each waypoint to scan.
  if (guard.wait > 0) {
    guard.wait -= dt;
    guard.facing += Math.sin(guard.wait * 2.2) * dt * 0.9;
    return;
  }
  const [tx, ty] = guard.route[guard.target];
  if (walkToward(guard, tx, ty, GUARD_SPEED, dt, vaultOpen)) {
    guard.wait = guard.pause;
    guard.target = (guard.target + 1) % guard.route.length;
  }
}
