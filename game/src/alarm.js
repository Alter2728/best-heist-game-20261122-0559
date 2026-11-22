// The alarm meter: one number the whole game hangs on. Sightings feed it,
// darkness starves it. At full it trips — the thief is caught, fairly,
// because the meter warned in red long before it filled.

import { ALARM_MAX, ALARM_RISE, ALARM_DECAY, ALARM_WARN } from "./config.js";

export function makeAlarm() {
  return { level: 0, tripped: false, warned: false, trips: 0 };
}

// sighting: strongest 0..1 detection this frame across guards and cameras.
export function updateAlarm(alarm, dt, sighting) {
  if (sighting > 0) {
    alarm.level += ALARM_RISE * sighting * dt;
  } else {
    alarm.level -= ALARM_DECAY * dt;
  }
  alarm.level = Math.max(0, Math.min(ALARM_MAX, alarm.level));
  const wasWarned = alarm.warned;
  alarm.warned = alarm.level >= ALARM_WARN;
  if (alarm.level >= ALARM_MAX && !alarm.tripped) {
    alarm.tripped = true;
    alarm.trips += 1;
  }
  return { justWarned: alarm.warned && !wasWarned, justTripped: alarm.tripped };
}

export function alarmFraction(alarm) {
  return alarm.level / ALARM_MAX;
}
