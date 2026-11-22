// Keyboard and mouse state, gathered once per frame by the game loop.
// One-shot presses (smoke, coin, pause) are consumed so a held key fires once.

export function makeInput(canvas) {
  const state = {
    left: false, right: false, up: false, down: false,
    sneak: false, interact: false,
    pressed: new Set(),
    mouseX: 480, mouseY: 320,
  };
  const held = {
    ArrowLeft: "left", KeyA: "left",
    ArrowRight: "right", KeyD: "right",
    ArrowUp: "up", KeyW: "up",
    ArrowDown: "down", KeyS: "down",
    ShiftLeft: "sneak", ShiftRight: "sneak",
    KeyE: "interact",
  };
  window.addEventListener("keydown", (ev) => {
    if (held[ev.code]) state[held[ev.code]] = true;
    if (!ev.repeat) state.pressed.add(ev.code);
    if (ev.code.startsWith("Arrow")) ev.preventDefault();
  });
  window.addEventListener("keyup", (ev) => {
    if (held[ev.code]) state[held[ev.code]] = false;
  });
  canvas.addEventListener("mousemove", (ev) => {
    const rect = canvas.getBoundingClientRect();
    state.mouseX = ((ev.clientX - rect.left) / rect.width) * canvas.width;
    state.mouseY = ((ev.clientY - rect.top) / rect.height) * canvas.height;
  });
  canvas.addEventListener("mousedown", () => state.pressed.add("Mouse0"));
  return state;
}

export function consumePress(input, code) {
  if (input.pressed.has(code)) {
    input.pressed.delete(code);
    return true;
  }
  return false;
}

export function clearPresses(input) {
  input.pressed.clear();
}
