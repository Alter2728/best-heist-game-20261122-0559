// Staged frames for the entry's screenshots: ?shot=cover|play|vault|win
// poses the real game in a telling moment — thief crossing the gallery,
// cones sweeping, cameras watching, loot glowing, alarm meter showing —
// then holds it still so the maker's capture is a true render of the code.

export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get("shot");
  if (!shot) return null;
  return { name: shot, seed: Number(params.get("seed") || 7) };
}

export function stageShot(game, name) {
  game.state = "play";
  game.time = 42;
  if (name === "cover") {
    // Mid-gallery, two guards converging, camera sweeping in, alarm warm.
    game.thief.x = 480;
    game.thief.y = 452;
    game.thief.facing = -Math.PI / 2;
    game.thief.haul = 2700;
    game.thief.pieces = 2;
    game.guards[0].x = 480; game.guards[0].y = 330; game.guards[0].facing = Math.PI / 2;
    if (game.guards[1]) { game.guards[1].x = 640; game.guards[1].y = 560; game.guards[1].facing = Math.PI; }
    if (game.cameras[0]) { game.cameras[0].facing = Math.PI / 2 - 0.35; }
    game.alarm.level = 34;
    game.hint = "Cross between the cones — the cases are cover.";
  } else if (name === "play") {
    // Spotted: alarm in the red, guard turning, smoke just dropped.
    game.thief.x = 360;
    game.thief.y = 380;
    game.thief.facing = 0.4;
    game.thief.haul = 4200;
    game.thief.pieces = 4;
    game.guards[0].x = 420; game.guards[0].y = 330; game.guards[0].facing = 2.2;
    game.guards[0].seesThief = true;
    if (game.cameras[0]) { game.cameras[0].facing = Math.PI / 2 + 0.2; game.cameras[0].seesThief = true; }
    game.belt.smokes.push({ x: 395, y: 362, r: 74, t: 4 });
    game.belt.smokeLeft = 2;
    game.alarm.level = 71;
    game.hint = "Seen! Smoke breaks the line — move.";
  } else if (name === "vault") {
    // At the vault door, lockpick half done, Sunstone beyond.
    game.thief.x = 480;
    game.thief.y = 196;
    game.thief.facing = -Math.PI / 2;
    game.thief.haul = 5600;
    game.thief.pieces = 6;
    game.thief.channel = { kind: "lock", target: null, t: 1.9, needed: 3.2 };
    game.guards[0].x = 480; game.guards[0].y = 300; game.guards[0].facing = Math.PI / 2;
    if (game.cameras[0]) { game.cameras[0].facing = Math.PI / 2 + 0.55; }
    game.alarm.level = 18;
    game.hint = "Hold E — the lock takes time, and time is exposure.";
  } else if (name === "win") {
    // Out the south door with the Sunstone; the summary over the floor.
    game.thief.x = 480;
    game.thief.y = 590;
    game.thief.haul = 16800;
    game.thief.pieces = 8;
    for (const item of game.loot) item.taken = true;
    game.vaultOpen = true;
    game.peakAlarm = 63;
    game.time = 187;
    game.state = "win";
  }
  game.peakAlarm = Math.max(game.peakAlarm || 0, game.alarm.level);
  return game;
}
