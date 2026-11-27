import type { Car } from "./simulation";
import type { UrbanId } from "./urban";
import type { DriveEvent } from "../../content/drivingLessons";

export function note(car: Car, key: DriveEvent["key"]) {
  if (!car.events.some((e) => e.key === key))
    car.events.push({ key, time: Math.round(car.elapsed * 10) / 10 });
}
// All distances, vehicle lengths and prediction horizons are simulation parameters.
export function queueTail(t: number) {
  return 14 + Math.min(1, Math.max(0, t - 8) / 6) * 2 + Math.max(0, t - 20) * 3;
}
export function arrowOn(t: number) {
  return t % 42 >= 14 && t % 42 < 29;
}
export function lessonActors(id: UrbanId, car: Car) {
  const age =
    car.encounterAt === null ? 0 : Math.max(0, car.elapsed - car.encounterAt);
  // First usable green after arrival; once released, actors continue through.
  const greenAfter = (time: number) => {
    const phase = time % 42;
    return time + (phase < 8 ? 8 - phase : phase >= 27 ? 50 - phase : 0);
  };
  const released = (delay: number) =>
    car.encounterAt === null
      ? 0
      : Math.max(0, car.elapsed - greenAfter(car.encounterAt + delay));
  const walker =
    id === "delivery"
      ? {
          x: -6.7 + Math.max(0, Math.min(1, (age - 4) / 8)) * 13.4,
          z: 23,
          active: age >= 3.3 && age < 12,
        }
      : null;
  const cyclist =
    id === "cycle"
      ? { x: -5.15, z: Math.min(33, car.elapsed * 4 - 8) + released(9) * 4.3 }
      : null;
  const lead =
    id === "snow"
      ? {
          x: -3,
          z: 16 + 9 * (1 - (1 - Math.min(1, age / 6)) ** 2) + released(10) * 4,
        }
      : null;
  return { walker, cyclist, lead };
}
export function assessLesson(id: UrbanId, car: Car, noseZ: number) {
  const { lead, walker, cyclist } = lessonActors(id, car);
  if (id === "queue" && !car.entered) {
    const room = queueTail(car.elapsed) - 2 - (12 + 1.15);
    if (room < 4.7) {
      if (noseZ >= 34) return "queue";
      if (noseZ > 28 && car.speed === 0) note(car, "queueWait");
    }
  }
  if (id === "lanes" && !car.entered && noseZ >= 29 && car.x <= -3)
    return "arrow";
  if (id === "delivery" && !car.crossed) {
    if (
      walker &&
      walker.x < -0.3 &&
      noseZ > 15 &&
      noseZ < 18 &&
      car.speed ** 2 / 12 > 22 - noseZ
    )
      return "van";
    if (walker?.active && walker.x < -0.3) {
      if (noseZ > 21.9 && car.z < 24.8) return "walk";
      if (noseZ > 15 && car.speed === 0) note(car, "walkWait");
    }
    if (car.z > 25) {
      car.crossed = true;
      note(car, "exitClear");
    }
  }
  if (lead && Math.abs(car.x - lead.x) < 1.8 && car.z < lead.z + 3) {
    const gap = lead.z - 2 - noseZ;
    if (gap < 0) return "rear";
    if (gap > 1 && gap < 12 && car.speed === 0 && car.z > 5)
      note(car, "winterGap");
  }
  if (cyclist && !car.crossed) {
    const relative = cyclist.z - car.z;
    if (relative > -9 && relative < 3 && car.z > 30) {
      if (car.x + 2 * Math.sin(car.yaw) < -4.4) return "bike";
      if (car.speed === 0) note(car, "bikeWait");
    }
    if (car.x < -7) car.crossed = true;
  }
  return null;
}
