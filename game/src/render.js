// All drawing for The Gilded Hour: a lamplit museum floor where cover,
// danger and loot read at a glance — pale glass cases to hide behind,
// yellow guard cones, red camera cones, gold loot, and the alarm meter
// across the top of the frame. Everything is shapes; there are no images.

import {
  VIEW_W, VIEW_H, COLORS,
  GUARD_VIEW_DIST, GUARD_VIEW_HALF_ANGLE,
  CAMERA_VIEW_DIST, CAMERA_VIEW_HALF_ANGLE, ALARM_WARN,
} from "./config.js";
import { BLOCKERS, VAULT_DOOR, EXIT } from "./world.js";
import { alarmFraction } from "./alarm.js";

function drawFloor(ctx) {
  ctx.fillStyle = COLORS.floorA;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Checkerboard stone tiles.
  ctx.fillStyle = COLORS.floorB;
  const tile = 48;
  for (let y = 0; y < VIEW_H / tile; y++) {
    for (let x = 0; x < VIEW_W / tile; x++) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * tile, y * tile, tile, tile);
    }
  }
  // The central carpet runner, south door to vault.
  ctx.fillStyle = COLORS.carpet;
  ctx.fillRect(432, 168, 96, VIEW_H - 168 - 18);
  ctx.strokeStyle = COLORS.carpetEdge;
  ctx.lineWidth = 2;
  ctx.strokeRect(432, 168, 96, VIEW_H - 168 - 18);
  // Vault floor, richer stone.
  ctx.fillStyle = "#232b42";
  ctx.fillRect(318, 18, 324, 132);
  ctx.fillStyle = COLORS.gold;
  ctx.font = "11px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("V A U L T", 480, 140);
}

function drawBlockers(ctx, vaultOpen) {
  for (const b of BLOCKERS) {
    if (b.kind === "wall") {
      ctx.fillStyle = COLORS.wall;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = COLORS.wallTop;
      ctx.fillRect(b.x, b.y, b.w, Math.min(4, b.h));
    } else {
      ctx.fillStyle = COLORS.caseWood;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = COLORS.caseGlass;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(b.x + 4, b.y + 4, b.w - 8, b.h - 8);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = COLORS.gold;
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x + 4, b.y + 4, b.w - 8, b.h - 8);
    }
  }
  // Vault door: barred gold while locked, swung open once picked.
  ctx.fillStyle = vaultOpen ? "#1d2a1d" : "#8a6d1f";
  ctx.fillRect(VAULT_DOOR.x, VAULT_DOOR.y, VAULT_DOOR.w, VAULT_DOOR.h);
  if (!vaultOpen) {
    ctx.fillStyle = COLORS.gem;
    ctx.beginPath();
    ctx.arc(VAULT_DOOR.x + VAULT_DOOR.w / 2, VAULT_DOOR.y + VAULT_DOOR.h / 2, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // South exit.
  ctx.fillStyle = COLORS.exit;
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = COLORS.exitGlow;
  ctx.font = "bold 12px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("EXIT", EXIT.x + EXIT.w / 2, EXIT.y + 21);
}

function drawCone(ctx, x, y, facing, halfAngle, dist, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, dist, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.fill();
}

function drawFigure(ctx, x, y, facing, body, trim, radius) {
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = trim;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Facing tick.
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(facing) * (radius + 5), y + Math.sin(facing) * (radius + 5));
  ctx.stroke();
  // Hat brim.
  ctx.fillStyle = trim;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

function drawLoot(ctx, loot, time) {
  for (const item of loot) {
    if (item.taken) continue;
    const pulse = 1 + Math.sin(time * 3 + item.x) * 0.15;
    const r = (item.big ? 11 : 7) * pulse;
    ctx.fillStyle = COLORS.gem;
    ctx.beginPath();
    ctx.moveTo(item.x, item.y - r);
    ctx.lineTo(item.x + r * 0.7, item.y);
    ctx.lineTo(item.x, item.y + r);
    ctx.lineTo(item.x - r * 0.7, item.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#fff3b0";
    ctx.lineWidth = 1;
    ctx.stroke();
    if (item.big) {
      ctx.fillStyle = COLORS.gold;
      ctx.font = "bold 10px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("SUNSTONE", item.x, item.y - 20);
    }
  }
}

function drawSmokeAndCoins(ctx, belt) {
  for (const s of belt.smokes) {
    ctx.fillStyle = COLORS.smoke;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * Math.min(1, s.t), 0, Math.PI * 2);
    ctx.fill();
  }
  for (const c of belt.coins) {
    ctx.fillStyle = COLORS.gem;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 217, 77, 0.5)";
    ctx.beginPath();
    ctx.arc(c.x, c.y, 10 + (2.2 - c.t) * 22, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawHud(ctx, game) {
  // Alarm meter across the top: the one number that matters.
  const frac = alarmFraction(game.alarm);
  ctx.fillStyle = "rgba(5, 8, 14, 0.82)";
  ctx.fillRect(18, 24, VIEW_W - 36, 30);
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 24, VIEW_W - 36, 30);
  ctx.fillStyle = game.alarm.level >= ALARM_WARN ? COLORS.alarmHigh : COLORS.alarmLow;
  ctx.fillRect(22, 28, (VIEW_W - 44) * frac, 22);
  ctx.fillStyle = "#0b0e14";
  ctx.font = "bold 13px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText("ALARM", 28, 44);
  ctx.textAlign = "right";
  ctx.fillText(`${Math.round(game.alarm.level)}%`, VIEW_W - 28, 44);
  // Haul, tools, clock along the bottom.
  ctx.fillStyle = "rgba(5, 8, 14, 0.82)";
  ctx.fillRect(18, VIEW_H - 52, 330, 30);
  ctx.strokeStyle = COLORS.gold;
  ctx.strokeRect(18, VIEW_H - 52, 330, 30);
  ctx.fillStyle = COLORS.text;
  ctx.font = "13px Georgia, serif";
  ctx.textAlign = "left";
  const mins = Math.floor(game.time / 60);
  const secs = Math.floor(game.time % 60).toString().padStart(2, "0");
  ctx.fillText(
    `Haul $${game.thief.haul.toLocaleString("en-US")}  ·  Smoke ×${game.belt.smokeLeft} (Q)  ·  Coins ×${game.belt.coinsLeft} (F)  ·  ${mins}:${secs}`,
    26, VIEW_H - 32,
  );
  ctx.textAlign = "right";
  ctx.fillStyle = COLORS.dim;
  ctx.fillText(game.nightName, VIEW_W - 26, VIEW_H - 32);
  // Channel progress over the thief's head.
  if (game.thief.channel) {
    const ch = game.thief.channel;
    const w = 44;
    ctx.fillStyle = "rgba(5,8,14,0.8)";
    ctx.fillRect(game.thief.x - w / 2, game.thief.y - 30, w, 7);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(game.thief.x - w / 2, game.thief.y - 30, w * (ch.t / ch.needed), 7);
  }
  if (game.hint) {
    ctx.fillStyle = COLORS.text;
    ctx.font = "14px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(game.hint, VIEW_W / 2, 78);
  }
}

export function drawGame(ctx, game) {
  drawFloor(ctx);
  // Cones under everything solid, so cover reads as cover.
  for (const cam of game.cameras) {
    drawCone(ctx, cam.x, cam.y, cam.facing, CAMERA_VIEW_HALF_ANGLE, CAMERA_VIEW_DIST,
      cam.seesThief ? COLORS.coneCameraHot : COLORS.coneCamera);
  }
  for (const g of game.guards) {
    drawCone(ctx, g.x, g.y, g.facing, GUARD_VIEW_HALF_ANGLE, GUARD_VIEW_DIST,
      g.seesThief ? COLORS.coneGuardHot : COLORS.coneGuard);
  }
  drawBlockers(ctx, game.vaultOpen);
  drawLoot(ctx, game.loot, game.time);
  drawSmokeAndCoins(ctx, game.belt);
  for (const cam of game.cameras) {
    ctx.fillStyle = "#3a3f4a";
    ctx.fillRect(cam.x - 7, cam.y - 7, 14, 14);
    ctx.fillStyle = cam.seesThief ? "#ff5a4d" : "#ffb3ab";
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const g of game.guards) {
    drawFigure(ctx, g.x, g.y, g.facing, COLORS.guard, COLORS.guardTrim, g.radius);
    if (g.mode === "investigate" || g.mode === "look") {
      ctx.fillStyle = COLORS.gold;
      ctx.font = "bold 13px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("?", g.x, g.y - 20);
    }
    if (g.seesThief) {
      ctx.fillStyle = COLORS.alarmHigh;
      ctx.font = "bold 14px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("!", g.x, g.y - 20);
    }
  }
  drawFigure(ctx, game.thief.x, game.thief.y, game.thief.facing,
    COLORS.thief, COLORS.thiefTrim, game.thief.radius);
  if (game.thief.sneaking) {
    ctx.strokeStyle = "rgba(232, 199, 102, 0.6)";
    ctx.beginPath();
    ctx.arc(game.thief.x, game.thief.y, game.thief.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawHud(ctx, game);
  if (game.alarm.level >= ALARM_WARN && game.state === "play") {
    ctx.strokeStyle = `rgba(255, 90, 77, ${0.35 + 0.3 * Math.sin(game.time * 8)})`;
    ctx.lineWidth = 5;
    ctx.strokeRect(3, 3, VIEW_W - 6, VIEW_H - 6);
  }
}

function panel(ctx, title, lines, footer) {
  ctx.fillStyle = "rgba(5, 8, 14, 0.78)";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = "#11151f";
  ctx.fillRect(VIEW_W / 2 - 300, 150, 600, 340);
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(VIEW_W / 2 - 300, 150, 600, 340);
  ctx.fillStyle = COLORS.gold;
  ctx.font = "30px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(title, VIEW_W / 2, 205);
  ctx.fillStyle = COLORS.text;
  ctx.font = "15px Georgia, serif";
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 245 + i * 24));
  ctx.fillStyle = COLORS.dim;
  ctx.font = "13px Georgia, serif";
  ctx.fillText(footer, VIEW_W / 2, 462);
}

export function drawTitle(ctx, game) {
  drawGame(ctx, game);
  panel(ctx, "THE GILDED HOUR", [
    "One museum. One night. One thief.",
    "",
    "Empty the glass cases, pick the vault lock,",
    "take the Sunstone, and leave by the south door.",
    "Guards see in yellow, cameras in red.",
    "Cases break sight. Smoke and coins are finite.",
    "",
    "Press 1, 2 or 3 to choose the night.",
  ], "WASD move · Shift sneak · E hands · Q smoke · F coin · P pause");
}

export function drawCaught(ctx, game) {
  drawGame(ctx, game);
  panel(ctx, "CAUGHT", [
    "The alarm filled and the gallery lights came up.",
    "",
    `You were holding $${game.thief.haul.toLocaleString("en-US")} of the museum's treasures.`,
    "The meter warned you in red — next time, break sight sooner.",
    "",
    "Press R to try the night again.",
  ], "Tip: a coin pulls a guard off route; smoke buys four seconds.");
}

export function drawWin(ctx, game) {
  drawGame(ctx, game);
  const mins = Math.floor(game.time / 60);
  const secs = Math.floor(game.time % 60).toString().padStart(2, "0");
  const bonus = game.thief.pieces >= 8 ? "A clean sweep — every case empty." :
    game.thief.pieces >= 5 ? "A handsome haul." : "You left plenty behind.";
  panel(ctx, "CLEAN GETAWAY", [
    `Haul: $${game.thief.haul.toLocaleString("en-US")} in ${game.thief.pieces} pieces`,
    `Time inside: ${mins}:${secs}   ·   Alarm peaked at ${Math.round(game.peakAlarm)}%`,
    "",
    bonus,
    "",
    "Press R for another night, or 1 / 2 / 3 to pick one.",
  ], "The Gilded Hour — an original heist in one room.");
}

export function drawPaused(ctx, game) {
  drawGame(ctx, game);
  panel(ctx, "PAUSED", ["The museum holds its breath.", "", "Press P to slip back in."], "");
}
