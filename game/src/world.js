// The museum floor: one hand-drawn plan the thief crosses in a single frame.
// Walls and display cases block movement and sight; doors and the south exit
// are the only gaps. Three nights reuse the plan with harder patrols.

import { VIEW_W, VIEW_H } from "./config.js";

// Axis-aligned blockers. kind: "wall" (full height) or "case" (display case:
// blocks sight and movement, drawn with a glass top).
export const BLOCKERS = [
  // Outer shell with a gap for the south exit door.
  { x: 0, y: 0, w: VIEW_W, h: 18, kind: "wall" },
  { x: 0, y: 0, w: 18, h: VIEW_H, kind: "wall" },
  { x: VIEW_W - 18, y: 0, w: 18, h: VIEW_H, kind: "wall" },
  { x: 0, y: VIEW_H - 18, w: 428, h: 18, kind: "wall" },
  { x: 532, y: VIEW_H - 18, w: VIEW_W - 532, h: 18, kind: "wall" },
  // Vault room across the north side, door at its centre.
  { x: 300, y: 18, w: 18, h: 150, kind: "wall" },
  { x: 642, y: 18, w: 18, h: 150, kind: "wall" },
  { x: 300, y: 150, w: 156, h: 18, kind: "wall" },
  { x: 504, y: 150, w: 156, h: 18, kind: "wall" },
  // West service corridor wall with two gaps.
  { x: 168, y: 168, w: 18, h: 120, kind: "wall" },
  { x: 168, y: 336, w: 18, h: 140, kind: "wall" },
  // East gallery wall with two gaps.
  { x: 774, y: 168, w: 18, h: 120, kind: "wall" },
  { x: 774, y: 336, w: 18, h: 140, kind: "wall" },
  // Display cases in the central gallery: cover to hug.
  { x: 288, y: 300, w: 96, h: 34, kind: "case" },
  { x: 576, y: 300, w: 96, h: 34, kind: "case" },
  { x: 432, y: 392, w: 96, h: 34, kind: "case" },
  { x: 288, y: 478, w: 96, h: 34, kind: "case" },
  { x: 576, y: 478, w: 96, h: 34, kind: "case" },
  // Cases in the side rooms.
  { x: 52, y: 300, w: 84, h: 32, kind: "case" },
  { x: 52, y: 452, w: 84, h: 32, kind: "case" },
  { x: 824, y: 300, w: 84, h: 32, kind: "case" },
  { x: 824, y: 452, w: 84, h: 32, kind: "case" },
  // Vault pedestals.
  { x: 392, y: 66, w: 56, h: 30, kind: "case" },
  { x: 512, y: 66, w: 56, h: 30, kind: "case" },
];

// The vault door: solid until picked, then open for the rest of the night.
export const VAULT_DOOR = { x: 456, y: 150, w: 48, h: 18 };

export const EXIT = { x: 428, y: VIEW_H - 34, w: 104, h: 34 };
export const THIEF_START = { x: 480, y: VIEW_H - 64 };

// Loot: small pieces in the cases, the Sunstone in the vault.
export const LOOT = [
  { id: "mask", name: "Jade mask", x: 336, y: 317, value: 1200, big: false },
  { id: "vase", name: "Porcelain vase", x: 624, y: 317, value: 1500, big: false },
  { id: "coins", name: "Roman coins", x: 480, y: 409, value: 900, big: false },
  { id: "dagger", name: "Ceremonial dagger", x: 336, y: 495, value: 1100, big: false },
  { id: "crown", name: "Silver crown", x: 624, y: 495, value: 1800, big: false },
  { id: "west", name: "Brass astrolabe", x: 94, y: 316, value: 800, big: false },
  { id: "east", name: "Enamel snuffbox", x: 866, y: 316, value: 800, big: false },
  { id: "sunstone", name: "THE SUNSTONE", x: 480, y: 62, value: 9000, big: true },
];

// Patrol routes per night. Waypoints are walked in a loop with pauses.
export const NIGHTS = [
  {
    name: "Night 1 — A Quiet Opening",
    guards: [
      { route: [[402, 250], [402, 440], [402, 250]], pause: 1.2 },
      { route: [[240, 560], [720, 560], [240, 560]], pause: 1.0 },
    ],
    cameras: [
      { x: 480, y: 196, rest: Math.PI / 2, speed: 0.55 },
    ],
  },
  {
    name: "Night 2 — Extra Staff",
    guards: [
      { route: [[402, 250], [402, 440], [402, 250]], pause: 1.0 },
      { route: [[240, 560], [720, 560], [240, 560]], pause: 0.8 },
      { route: [[52, 384], [150, 384], [52, 384]], pause: 1.1 },
    ],
    cameras: [
      { x: 480, y: 196, rest: Math.PI / 2, speed: 0.7 },
      { x: 866, y: 196, rest: Math.PI / 2, speed: 0.6 },
    ],
  },
  {
    name: "Night 3 — The Gala",
    guards: [
      { route: [[402, 250], [402, 440], [402, 250]], pause: 0.8 },
      { route: [[240, 560], [720, 560], [240, 560]], pause: 0.7 },
      { route: [[52, 384], [150, 384], [52, 384]], pause: 0.9 },
      { route: [[908, 384], [810, 384], [908, 384]], pause: 0.9 },
      { route: [[384, 108], [576, 108], [384, 108]], pause: 0.6 },
    ],
    cameras: [
      { x: 480, y: 196, rest: Math.PI / 2, speed: 0.8 },
      { x: 866, y: 196, rest: Math.PI / 2, speed: 0.7 },
      { x: 94, y: 196, rest: Math.PI / 2, speed: 0.65 },
    ],
  },
];

export function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function circleHitsBlockers(x, y, radius, vaultOpen) {
  const solids = vaultOpen ? BLOCKERS : BLOCKERS.concat([VAULT_DOOR]);
  for (const b of solids) {
    const nx = Math.max(b.x, Math.min(x, b.x + b.w));
    const ny = Math.max(b.y, Math.min(y, b.y + b.h));
    const dx = x - nx;
    const dy = y - ny;
    if (dx * dx + dy * dy < radius * radius) return true;
  }
  return false;
}

// Move a circle by (dx, dy), sliding along blockers one axis at a time.
export function moveCircle(pos, dx, dy, radius, vaultOpen) {
  const next = { x: pos.x, y: pos.y };
  if (!circleHitsBlockers(next.x + dx, next.y, radius, vaultOpen)) next.x += dx;
  if (!circleHitsBlockers(next.x, next.y + dy, radius, vaultOpen)) next.y += dy;
  next.x = Math.max(radius + 18, Math.min(VIEW_W - 18 - radius, next.x));
  next.y = Math.max(radius + 18, Math.min(VIEW_H - 18 - radius, next.y));
  return next;
}

function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
  const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
  const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

// True when nothing solid stands between two points (sampled edge test).
export function lineOfSight(x1, y1, x2, y2, vaultOpen) {
  const solids = vaultOpen ? BLOCKERS : BLOCKERS.concat([VAULT_DOOR]);
  for (const b of solids) {
    if (pointInRect(x1, y1, b) || pointInRect(x2, y2, b)) continue;
    const corners = [
      [b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h],
    ];
    for (let i = 0; i < 4; i++) {
      const [cx, cy] = corners[i];
      const [dx, dy] = corners[(i + 1) % 4];
      if (segmentsCross(x1, y1, x2, y2, cx, cy, dx, dy)) return false;
    }
    // A line passing straight through the middle crosses two edges, already
    // caught above; a line ending inside was skipped by the rect test.
  }
  return true;
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
