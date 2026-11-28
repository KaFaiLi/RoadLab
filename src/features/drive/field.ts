import type { FieldDrive, Task } from "../../content/fieldDrives";
import { advanceVehicle, spawn, type Car, type Controls } from "./simulation";
import { note } from "./encounters";
import type { Skill } from "../../content/drivingLessons";

export const fieldFinish = 184;
export const checkpoint = (index: number) => 40 + index * 54;
export const fieldX = (d: FieldDrive, z: number) =>
  d.bend * 2 * (1 - Math.cos(z / 24));
export const fieldGrip = (d: FieldDrive) =>
  d.weather === "ice"
    ? 0.4
    : d.weather === "snow"
      ? 0.52
      : d.weather === "rain"
        ? 0.83
        : 1;
export const fieldSpawn = () => ({ ...spawn(), x: -2.65 });
export function fieldState(task: Task, age: number) {
  const walk = (start: number, from: number, duration: number) =>
    from * (1 - 2 * Math.max(0, Math.min(1, (age - start) / duration)));
  const people =
    task === "pair"
      ? [walk(1, -5.8, 7), walk(4, 5.8, 9)]
      : task === "hidden"
        ? [walk(3, -5.8, 8)]
        : task === "queue"
          ? [walk(4, -5.8, 7)]
          : task === "zebra"
            ? [walk(1, -5.8, 8)]
            : [];
  const departure = task === "bus" ? 9 : 12;
  const lead =
    task === "bus"
      ? 3.2 + Math.max(0, age - departure) * 5
      : 4.2 + Math.min(1, age / 5) * 1.0 + Math.max(0, age - departure) * 5;
  const crossX = -17 + Math.max(0, age - 3) * 4;
  const deerX = walk(3, 5.8, 6.5);
  return {
    people,
    lead,
    crossX,
    deerX,
    barrier: Math.max(0, Math.min(1, (12 - age) / 2)),
    red: age < (task === "portable" ? 11 : 8),
  };
}
const skills: Partial<Record<Task, Skill>> = {
  train: "railStop",
  tracks: "railStop",
  edge: "conePass",
  centre: "conePass",
  limit20: "postedSpeed",
  limit30: "postedSpeed",
};
export function fieldDrive(
  car: Car,
  keys: Controls,
  delta: number,
  d: FieldDrive,
) {
  if (car.result) return;
  const dt = Math.min(0.05, Math.max(0, delta));
  car.elapsed += dt;
  advanceVehicle(car, keys, dt, 0.4, fieldGrip(d));
  const nose = car.z + 2 * Math.cos(car.yaw),
    x = car.x - fieldX(d, car.z);
  if (Math.abs(x) > 4.65 || car.z < -2) {
    car.result = "curb";
    return;
  }
  car.offLane = x > -0.45 ? car.offLane + dt : 0;
  if (car.offLane > 1) {
    car.result = "lane";
    return;
  }
  const task = d.stages[car.step];
  if (!task) {
    if (nose >= fieldFinish) car.result = "complete";
    return;
  }
  const z = checkpoint(car.step),
    offset = nose - z;
  if (offset < -30 && car.encounterAt === null) return;
  car.encounterAt ??= car.elapsed;
  const age = car.elapsed - car.encounterAt,
    state = fieldState(task, age);
  const halted = offset >= -5 && offset <= 0 && car.speed === 0;
  if (halted) car.stopped = true;
  const mustStop =
    task === "stop" || task === "side" || task === "tracks" || task === "train";
  if (offset > 0 && mustStop && !car.stopped) {
    car.result = "stop";
    return;
  }
  if (offset > 0 && offset < 5 && task === "train" && state.barrier > 0) {
    car.result = "railGate";
    return;
  }
  if (
    offset > 0 &&
    offset < 5 &&
    task === "side" &&
    state.crossX < 4 &&
    state.crossX > -13
  ) {
    car.result = "crossTraffic";
    return;
  }
  if ((task === "portable" || task === "red") && offset > 0 && state.red) {
    car.result = "red";
    return;
  }
  if (halted && (task === "portable" || task === "red") && state.red)
    note(car, "lightWait");
  if (halted && (task === "stop" || task === "side")) note(car, "sideStop");
  if (halted && state.people.length && age < 12) note(car, "walkWait");
  if (
    task === "hidden" &&
    offset > -8 &&
    offset < -4 &&
    age < 9 &&
    car.speed ** 2 / (12 * fieldGrip(d)) > -offset
  ) {
    car.result = "van";
    return;
  }
  if (task === "queue" && halted && state.lead - 2 - 4 < 4.7)
    note(car, "queueWait");
  if (
    task === "queue" &&
    offset > 0 &&
    offset < 4 &&
    state.lead - 2 - 4 < 4.7
  ) {
    car.result = "queue";
    return;
  }
  // The crossing is 2 m beyond its stop line. Protect approaching walkers as well as those in the lane.
  if (
    offset > 0 &&
    car.z < z + 4 &&
    state.people.some((p, i) => (i === 0 ? p < 0.6 : p < 2 && p > -5.6))
  ) {
    car.result = "walk";
    return;
  }
  if (task === "bus" && halted && age < 9) note(car, "busWait");
  if ((task === "bus" || task === "queue") && offset >= state.lead - 2) {
    car.result = "rear";
    return;
  }
  if (
    task === "deer" &&
    offset > 0 &&
    offset < 5 &&
    age < 9.5 &&
    state.deerX < 3
  ) {
    car.result = "animal";
    return;
  }
  if (
    (task === "edge" || task === "centre") &&
    offset > 0 &&
    offset < 12 &&
    (task === "edge" ? x < -2.72 : x > -2.78)
  ) {
    car.result = "cones";
    return;
  }
  if (
    (task === "limit20" || task === "limit30") &&
    offset >= 0 &&
    offset < 14 &&
    car.speed * 3.6 > (task === "limit20" ? 20 : 30) + 0.05
  ) {
    car.result = "speedZone";
    return;
  }
  if (offset >= 14) {
    const key = skills[task];
    if (key) note(car, key);
    car.step++;
    car.encounterAt = null;
    car.stopped = false;
  }
}
