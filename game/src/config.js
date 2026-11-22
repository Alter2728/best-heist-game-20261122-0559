// Shared numbers for The Gilded Hour: canvas size, speeds, cone geometry and the palette.
// Every other module reads from here so tuning the game means editing one file.

export const VIEW_W = 960;
export const VIEW_H = 640;

export const TILE = 32;

export const THIEF_SPEED = 150;      // pixels per second, walking
export const THIEF_SNEAK_SPEED = 78; // pixels per second, sneaking
export const THIEF_RADIUS = 11;

export const GUARD_SPEED = 62;
export const GUARD_CHASE_SPEED = 118;
export const GUARD_RADIUS = 12;
export const GUARD_VIEW_DIST = 168;
export const GUARD_VIEW_HALF_ANGLE = 0.62; // radians either side of facing

export const CAMERA_VIEW_DIST = 190;
export const CAMERA_VIEW_HALF_ANGLE = 0.42;
export const CAMERA_SWEEP = 0.85; // radians either side of its rest angle

export const ALARM_MAX = 100;
export const ALARM_RISE = 46;   // per second at point blank, scaled by distance and sneak
export const ALARM_DECAY = 13;  // per second while unseen
export const ALARM_WARN = 55;   // meter turns red and the sting plays

export const SMOKE_COUNT = 3;
export const SMOKE_RADIUS = 74;
export const SMOKE_SECONDS = 4.5;
export const COIN_COUNT = 4;
export const COIN_RANGE = 260;
export const COIN_HEAR_RADIUS = 150;

export const LOCKPICK_SECONDS = 3.2;

export const COLORS = {
  floorA: "#1a2030",
  floorB: "#161c29",
  wall: "#2c3550",
  wallTop: "#3d4a70",
  caseWood: "#5b4128",
  caseGlass: "#9fd4e8",
  carpet: "#5e1f2e",
  carpetEdge: "#c9a227",
  gold: "#e8c766",
  gem: "#ffd94d",
  thief: "#20242e",
  thiefTrim: "#e8c766",
  guard: "#31456e",
  guardTrim: "#d8dee9",
  coneGuard: "rgba(255, 214, 90, 0.20)",
  coneGuardHot: "rgba(255, 120, 60, 0.30)",
  coneCamera: "rgba(255, 70, 70, 0.16)",
  coneCameraHot: "rgba(255, 60, 60, 0.30)",
  smoke: "rgba(190, 198, 214, 0.55)",
  exit: "#2e7d4f",
  exitGlow: "#7be2a8",
  text: "#e8e2d4",
  dim: "#9aa3b5",
  alarmLow: "#e8c766",
  alarmHigh: "#ff5a4d",
};
