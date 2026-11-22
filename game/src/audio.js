// Tiny synthesized sound: no audio files, just WebAudio blips shaped by
// hand — a coin clink, a loot chime, a lockpick tick, an alarm sting.
// Sound starts on the first key press or click, as browsers require.

let ctx = null;

export function ensureAudio() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function tone(freq, seconds, type, gain, slideTo) {
  const ac = ensureAudio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + seconds);
  amp.gain.setValueAtTime(gain, ac.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + seconds);
  osc.connect(amp).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + seconds);
}

export function sfxCoin() {
  tone(2093, 0.12, "triangle", 0.12);
  tone(1568, 0.18, "triangle", 0.08);
}

export function sfxLoot(big) {
  tone(880, 0.14, "sine", 0.12);
  tone(1318, 0.22, "sine", 0.1);
  if (big) tone(1760, 0.4, "sine", 0.12);
}

export function sfxTick() {
  tone(320, 0.05, "square", 0.05);
}

export function sfxSmoke() {
  tone(220, 0.35, "sawtooth", 0.05, 90);
}

export function sfxWarn() {
  tone(660, 0.16, "square", 0.07);
  tone(660, 0.16, "square", 0.07);
}

export function sfxCaught() {
  tone(520, 0.5, "sawtooth", 0.12, 130);
}

export function sfxWin() {
  tone(659, 0.16, "triangle", 0.12);
  tone(784, 0.16, "triangle", 0.12);
  tone(988, 0.3, "triangle", 0.12);
}
