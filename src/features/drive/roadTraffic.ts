import type { FieldDrive } from "../../content/fieldDrives";
import type { Car } from "./simulation";
import {
  checkpoint,
  fieldFinish,
  fieldSignal,
  fieldState,
  fieldX,
} from "./field";
import { box } from "./world";

export function newTraffic(d?: FieldDrive) {
  return { z: 85 + (d?.signalOffset ?? 0), speed: 6, stoppedAt: -1, wait: 0 };
}
type Traffic = ReturnType<typeof newTraffic>;
export function moveTraffic(t: Traffic, d: FieldDrive, car: Car, dt: number) {
  // Locate the first occupied crossing ahead of the oncoming car.
  let available = Infinity;
  for (let i = d.stages.length - 1; i >= 0; i--) {
    const line = checkpoint(i, d) + 7,
      gap = t.z - line;
    if (gap < -0.05) continue;
    const task = d.stages[i],
      age =
        i < car.step
          ? 45
          : i === car.step && car.encounterAt !== null
            ? car.elapsed - car.encounterAt
            : 0;
    const actor = fieldState(task, age);
    const rail = task === "train" || task === "tracks";
    const blocked =
      (rail &&
        (t.stoppedAt !== i || (task === "train" && actor.barrier > 0))) ||
      ((task === "red" || task === "portable") &&
        fieldSignal(d, i, car.elapsed, age) !== "green") ||
      actor.people.some((x) => x > -0.7 && x < 5.65) ||
      (task === "deer" && age > 3 && age < 8);
    if (!blocked) continue;
    available = Math.max(0, gap);
    if (rail && gap < 0.1) {
      t.wait += dt;
      if (t.wait > 0.8) {
        t.stoppedAt = i;
        t.wait = 0;
      }
    }
    break;
  }
  const target = Math.min(7, Math.sqrt(6 * available));
  t.speed += Math.max(-4 * dt, Math.min(1.6 * dt, target - t.speed));
  t.z -= Math.min(available, t.speed * dt);
  if (t.z < -4 && car.z < fieldFinish - 55)
    Object.assign(t, newTraffic(d), { z: fieldFinish - 5 });
}
export function trafficMesh(t: Traffic, d: FieldDrive) {
  if (t.z < 0 || t.z > fieldFinish - 2) return [];
  const x = fieldX(d, t.z) + 2.65;
  return [
    ...box(x, 0.22, t.z, 1.8, 0.8, 3.9, "#718f9b"),
    ...box(x, 1.02, t.z, 1.45, 0.56, 1.85, "#47717f"),
    ...[-0.64, 0.64].flatMap((side) =>
      box(x + side, 0.64, t.z - 1.97, 0.27, 0.15, 0.05, "#fff0c4"),
    ),
  ];
}
