import { checkpoint, fieldGrip } from "../src/features/drive/field";
import { newTraffic, moveTraffic } from "../src/features/drive/roadTraffic";
import { it, expect } from "vitest";
import {
  advanceJourney,
  createJourney,
  streetPicker,
} from "../src/features/drive/journey";
import { fieldX, fieldSignal, fieldFinish } from "../src/features/drive/field";
import { junction, districts } from "../src/features/drive/urban";
import { neutral } from "../src/features/drive/simulation";
it("deals all 49 streets each cycle without repeating across the shuffle boundary", () => {
  const pick = streetPicker(() => 0.3),
    ids = Array.from({ length: 147 }, () => {
      const s = pick();
      return s.field?.id ?? s.route;
    });
  for (const i of [0, 49, 98])
    expect(new Set(ids.slice(i, i + 49)).size).toBe(49);
  expect(ids[48]).not.toBe(ids[49]);
  expect(ids[97]).not.toBe(ids[98]);
  expect(streetPicker(() => 0.6)().field?.id).not.toBe(
    streetPicker(() => 0.3)().field?.id,
  );
});
it("crosses a field seam while accelerating and keeps the odometer running", () => {
  const j = createJourney(() => 0.3),
    field = j.street.field!;
  const next = j.next;
  j.car.step = 3;
  j.car.z = fieldFinish - 2 - 0.01;
  j.car.x = fieldX(field, j.car.z) - 2.5;
  j.car.speed = 6;
  advanceJourney(j, { ...neutral(), gas: true }, 0.05);
  expect(j.streets).toBe(1);
  expect(j.street).toBe(next);
  expect(j.car.speed).toBeGreaterThan(6);
  expect(j.car.x).toBeCloseTo(-2.5, 1);
  expect(j.car.z).toBeGreaterThan(0);
  const distance = j.distance;
  advanceJourney(j, neutral(), 0.05);
  expect(j.distance).toBeGreaterThan(distance);
});
it.each([0.025, 0.145])(
  "connects a turning exit to a forward road at %s",
  (n) => {
    const j = createJourney(() => n);
    if (j.street.route === "town") throw Error("expected turn");
    const turn = districts[j.street.route].turn;
    Object.assign(j.car, {
      x: turn * (junction.finish - 0.01),
      z: junction.z + 3 * turn,
      yaw: (turn * Math.PI) / 2,
      speed: 4,
      entered: true,
      stopped: true,
    });
    advanceJourney(j, neutral(), 0.05);
    expect(j.streets).toBe(1);
    expect(j.car.x).toBeCloseTo(-3);
    expect(j.car.yaw).toBeCloseTo(0);
    expect(j.incidents).toBe(0);
  },
);
it("recovers from a hazard in the same trip", () => {
  const j = createJourney(() => 0.3);
  j.car.x = 100;
  const street = j.street;
  advanceJourney(j, neutral(), 0.05);
  expect(j.street).toBe(street);
  expect(j.incidents).toBe(1);
  expect(j.warning).toBe("curb");
  expect(j.car.speed).toBe(0);
  expect(j.car.result).toBeNull();
  advanceJourney(j, { ...neutral(), gas: true }, 0.05);
  expect(j.car.speed).toBeGreaterThan(0);
});
it("signals cycle independently of the player's approach", () => {
  const d = createJourney(() => 0.3).street.field!;
  expect(
    new Set(Array.from({ length: 36 }, (_, t) => fieldSignal(d, 0, t, 0))),
  ).toEqual(new Set(["red", "amber", "green"]));
});
it("drives through two connected streets with six encounters on ordinary inputs", () => {
  const j = createJourney(() => 0.68);
  for (let tick = 0; tick < 11000 && j.streets < 2; tick++) {
    const d = j.street.field!,
      c = j.car,
      t = d.stages[c.step],
      gap = checkpoint(c.step, d) - c.z - 2 * Math.cos(c.yaw);
    const offset =
      gap < 28 && t === "edge"
        ? -1.85
        : gap < 28 && t === "centre"
          ? -3.55
          : -2.65;
    const aim = Math.atan2(fieldX(d, c.z + 5) + offset - c.x, 5) - c.yaw;
    const age = c.encounterAt === null ? 0 : c.elapsed - c.encounterAt;
    const signal = t === "red" || t === "portable";
    const wait = signal
      ? fieldSignal(d, c.step, c.elapsed, age) !== "green" ||
        fieldSignal(d, c.step, c.elapsed + 4, age + 4) !== "green"
      : age < 16;
    const brake =
      !!t && gap > 0 && gap <= 2.3 + c.speed ** 2 / (14 * fieldGrip(d)) && wait;
    advanceJourney(
      j,
      {
        left: aim < -0.01,
        right: aim > 0.01,
        gas: !brake && c.speed < 4.25,
        brake,
      },
      0.05,
    );
  }
  expect(j.streets).toBe(2);
  expect(j.incidents).toBe(0);
  expect(j.distance).toBeGreaterThan(360);
});
it("oncoming traffic holds for the railway barrier and moves when it opens", () => {
  const j = createJourney(() => 0.68),
    d = j.street.field!,
    traffic = newTraffic(d);
  const z = checkpoint(0, d) + 7;
  traffic.z = z + 7;
  j.car.encounterAt = 0;
  for (let i = 0; i < 180; i++) {
    j.car.elapsed += 0.05;
    moveTraffic(traffic, d, j.car, 0.05);
  }
  expect(traffic.z).toBeCloseTo(z, 1);
  for (let i = 0; i < 160; i++) {
    j.car.elapsed += 0.05;
    moveTraffic(traffic, d, j.car, 0.05);
  }
  expect(traffic.z).toBeLessThan(z - 5);
});
