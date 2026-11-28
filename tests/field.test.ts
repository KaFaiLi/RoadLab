import { expect, it } from "vitest";
import {
  fieldDrives,
  fieldGroups,
  tasks,
  type Task,
} from "../src/content/fieldDrives";
import {
  checkpoint,
  fieldX,
  fieldSpawn,
  fieldDrive,
  fieldGrip,
} from "../src/features/drive/field";
import { neutral, type Result } from "../src/features/drive/simulation";
import { historySchema } from "../src/lib/game";

it("publishes forty distinct three-encounter drives with translated briefs and stable history IDs", () => {
  expect(fieldDrives).toHaveLength(40);
  expect(new Set(fieldDrives.map((d) => d.id)).size).toBe(40);
  expect(new Set(fieldDrives.map((d) => d.stages.join("/"))).size).toBe(40);
  for (const group of Object.keys(fieldGroups))
    expect(fieldDrives.filter((d) => d.group === group)).toHaveLength(5);
  for (const d of fieldDrives) {
    for (const l of ["en", "zh-Hant", "ja"] as const) {
      expect(d.name[l]).toBeTruthy();
      for (const t of d.stages) expect(tasks[t][l]).toBeTruthy();
    }
    expect(
      historySchema.safeParse({
        version: 1,
        locale: "en",
        attempts: [],
        last: null,
        drives: [
          { route: d.id, variant: 0, at: 1, completed: true, skills: [] },
        ],
      }).success,
    ).toBe(true);
  }
});
it.each(fieldDrives)(
  "can drive $id to the finish using only pedals and steering",
  (d) => {
    const car = fieldSpawn();
    for (let tick = 0; tick < 5000 && !car.result; tick++) {
      const gap = checkpoint(car.step) - car.z - 2 * Math.cos(car.yaw);
      const task = d.stages[car.step];
      const offset =
        gap < 28 && task === "edge"
          ? -1.85
          : gap < 28 && task === "centre"
            ? -3.55
            : -2.65;
      const aim =
        Math.atan2(fieldX(d, car.z + 5) + offset - car.x, 5) - car.yaw;
      const stop =
        task &&
        gap <= 2.3 + car.speed ** 2 / (14 * fieldGrip(d)) &&
        (car.encounterAt === null || car.elapsed - car.encounterAt < 16);
      fieldDrive(
        car,
        {
          left: aim < -0.01,
          right: aim > 0.01,
          gas: !stop && car.speed < 4.25,
          brake: Boolean(stop),
        },
        0.05,
        d,
      );
    }
    expect([car.result, car.step]).toEqual(["complete", 3]);
  },
);
const unsafe: [Task, Result, number, number, boolean][] = [
  ["train", "railGate", 6, 2, true],
  ["tracks", "stop", 15, 2, false],
  ["side", "crossTraffic", 7, 2, true],
  ["portable", "red", 9, 2, false],
  ["red", "red", 5, 2, false],
  ["hidden", "walk", 5, 2, false],
  ["pair", "walk", 7, 2, false],
  ["zebra", "walk", 4, 2, false],
  ["queue", "queue", 6, 2, false],
  ["bus", "rear", 6, 2, false],
  ["deer", "animal", 7, 2, false],
  ["limit20", "speedZone", 15, 8, false],
  ["limit30", "speedZone", 15, 10, false],
  ["edge", "cones", 15, 2, false],
  ["centre", "cones", 15, 2, false],
];
it.each(unsafe)(
  "recognises an unsafe %s encounter",
  (task, result, age, speed, stopped) => {
    const d = {
      ...fieldDrives[0],
      bend: 0,
      stages: [task, "stop", "red"] as const,
    };
    const car = {
      ...fieldSpawn(),
      z: 39.5,
      x: task === "edge" ? -3.6 : -2.65,
      encounterAt: 0,
      elapsed: age,
      speed,
      stopped,
    };
    fieldDrive(car, neutral(), 0.01, d);
    expect(car.result).toBe(result);
  },
);
