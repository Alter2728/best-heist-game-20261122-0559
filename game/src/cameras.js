// Cameras: fixed mounts that sweep their red cone back and forth. They never
// move and cannot be distracted, but their sweep is readable — cross on the
// swing, or spend smoke. A camera that sees the thief feeds the alarm.

import { CAMERA_VIEW_DIST, CAMERA_VIEW_HALF_ANGLE, CAMERA_SWEEP } from "./config.js";
import { lineOfSight, angleDiff } from "./world.js";

export function makeCamera(spec) {
  return {
    x: spec.x, y: spec.y,
    rest: spec.rest,
    speed: spec.speed,
    phase: 0,
    facing: spec.rest,
    seesThief: false,
  };
}

export function updateCamera(camera, dt) {
  camera.phase += dt * camera.speed;
  camera.facing = camera.rest + Math.sin(camera.phase) * CAMERA_SWEEP;
}

export function cameraSees(camera, thief, vaultOpen, smokeBlocks) {
  const dx = thief.x - camera.x;
  const dy = thief.y - camera.y;
  const dist = Math.hypot(dx, dy);
  if (dist > CAMERA_VIEW_DIST) return 0;
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, camera.facing)) > CAMERA_VIEW_HALF_ANGLE) return 0;
  if (!lineOfSight(camera.x, camera.y, thief.x, thief.y, vaultOpen)) return 0;
  if (smokeBlocks(camera.x, camera.y, thief.x, thief.y)) return 0;
  let strength = 1 - dist / CAMERA_VIEW_DIST;
  if (thief.sneaking) strength *= 0.5;
  if (!thief.moving) strength *= 0.75;
  return Math.max(0.08, strength);
}
