// The Gilded Hour — game state and loop. One museum floor, three nights,
// a thief with finite tools, guards and cameras feeding one alarm meter.
// States: title → play → caught | win, with pause. Screenshot scenes from
// shots.js freeze a staged frame instead of running the loop.

import { NIGHTS, LOOT, THIEF_START, EXIT } from "./world.js";
import { makeThief, updateThief, interactTarget, updateChannel, takeLoot, atExit } from "./thief.js";
import { makeGuard, updateGuard, guardSees, guardHearsCoin } from "./guards.js";
import { makeCamera, updateCamera, cameraSees } from "./cameras.js";
import { makeToolBelt, dropSmoke, tossCoin, updateTools, smokeBlocksLine } from "./tools.js";
import { makeAlarm, updateAlarm } from "./alarm.js";
import { makeInput, consumePress, clearPresses } from "./input.js";
import { drawGame, drawTitle, drawCaught, drawWin, drawPaused } from "./render.js";
import { shotFromUrl, stageShot } from "./shots.js";
import { ensureAudio, sfxCoin, sfxLoot, sfxTick, sfxSmoke, sfxWarn, sfxCaught, sfxWin } from "./audio.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = makeInput(canvas);

function newNight(index) {
  const spec = NIGHTS[index];
  return {
    nightIndex: index,
    nightName: spec.name,
    state: "play",
    time: 0,
    thief: makeThief(THIEF_START),
    guards: spec.guards.map(makeGuard),
    cameras: spec.cameras.map(makeCamera),
    loot: LOOT.map((item) => ({ ...item, taken: false })),
    belt: makeToolBelt(),
    alarm: makeAlarm(),
    vaultOpen: false,
    peakAlarm: 0,
    hint: "Empty the cases, pick the vault, leave south.",
    tickClock: 0,
  };
}

let game = newNight(0);
game.state = "title";

const shot = shotFromUrl();
if (shot) {
  game = newNight(shot.name === "cover" ? 1 : 0);
  stageShot(game, shot.name);
  drawOnce();
}

function drawOnce() {
  if (game.state === "title") drawTitle(ctx, game);
  else if (game.state === "caught") drawCaught(ctx, game);
  else if (game.state === "win") drawWin(ctx, game);
  else if (game.state === "paused") drawPaused(ctx, game);
  else drawGame(ctx, game);
}

function startNight(index) {
  game = newNight(index);
  ensureAudio();
}

function step(dt) {
  if (game.state === "title") {
    if (consumePress(input, "Digit1")) startNight(0);
    else if (consumePress(input, "Digit2")) startNight(1);
    else if (consumePress(input, "Digit3")) startNight(2);
    else if (consumePress(input, "Enter") || consumePress(input, "Mouse0")) startNight(0);
    return;
  }
  if (game.state === "caught" || game.state === "win") {
    if (consumePress(input, "KeyR")) startNight(game.nightIndex);
    else if (consumePress(input, "Digit1")) startNight(0);
    else if (consumePress(input, "Digit2")) startNight(1);
    else if (consumePress(input, "Digit3")) startNight(2);
    return;
  }
  if (consumePress(input, "KeyP")) {
    game.state = game.state === "paused" ? "play" : "paused";
    return;
  }
  if (game.state === "paused") return;
  if (consumePress(input, "KeyR")) {
    startNight(game.nightIndex);
    return;
  }

  game.time += dt;
  const smokeBlocks = (x1, y1, x2, y2) => smokeBlocksLine(game.belt, x1, y1, x2, y2);

  // Tools first: smoke at the feet, coin toward the mouse.
  if (consumePress(input, "KeyQ") && dropSmoke(game.belt, game.thief.x, game.thief.y)) sfxSmoke();
  if (consumePress(input, "KeyF")) {
    const coin = tossCoin(game.belt, game.thief.x, game.thief.y, input.mouseX, input.mouseY);
    if (coin) {
      sfxCoin();
      for (const g of game.guards) guardHearsCoin(g, coin);
    }
  }
  updateTools(game.belt, dt);

  updateThief(game.thief, dt, input, game.vaultOpen);

  // Hands-on work: loot lifts and the vault lock.
  const target = interactTarget(game.thief, game.loot, game.vaultOpen);
  const done = updateChannel(game.thief, dt, input.interact, target);
  if (game.thief.channel) {
    game.tickClock += dt;
    if (game.tickClock > 0.45) { sfxTick(); game.tickClock = 0; }
  }
  if (done && done.kind === "loot") {
    takeLoot(game.thief, done.target);
    sfxLoot(done.target.big);
    game.hint = `${done.target.name} — $${done.target.value.toLocaleString("en-US")}.`;
  } else if (done && done.kind === "lock") {
    game.vaultOpen = true;
    sfxLoot(false);
    game.hint = "The vault is open. The Sunstone is yours to take.";
  } else if (target && !game.thief.channel) {
    game.hint = target.kind === "lock" ? "Hold E to pick the vault lock." : `Hold E to take the ${target.target.name}.`;
  } else if (!game.thief.channel && game.time > 6) {
    game.hint = game.vaultOpen ? "Out the south door with the haul." : "Empty the cases, pick the vault, leave south.";
  }

  // Watchers.
  let sighting = 0;
  for (const cam of game.cameras) {
    updateCamera(cam, dt);
    const s = cameraSees(cam, game.thief, game.vaultOpen, smokeBlocks);
    cam.seesThief = s > 0;
    sighting = Math.max(sighting, s);
  }
  const alarmHot = game.alarm.level > 60;
  for (const g of game.guards) {
    const s = guardSees(g, game.thief, game.vaultOpen, smokeBlocks);
    g.seesThief = s > 0;
    sighting = Math.max(sighting, s);
    updateGuard(g, dt, game.thief, game.vaultOpen, alarmHot);
    // A guard who reaches the thief ends the night on the spot.
    if (Math.hypot(g.x - game.thief.x, g.y - game.thief.y) < g.radius + game.thief.radius) {
      game.alarm.level = 100;
    }
  }

  const events = updateAlarm(game.alarm, dt, sighting);
  game.peakAlarm = Math.max(game.peakAlarm, game.alarm.level);
  if (events.justWarned) sfxWarn();
  if (game.alarm.tripped) {
    game.state = "caught";
    sfxCaught();
    return;
  }

  // The getaway: south door with anything in the bag.
  if (atExit(game.thief, EXIT) && game.thief.pieces > 0) {
    game.state = "win";
    sfxWin();
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shot) {
    step(dt);
    clearPresses(input);
  }
  drawOnce();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
