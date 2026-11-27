import { describe, expect, it } from "vitest";
import { neutral } from "../src/features/drive/simulation";
import {
  districts,
  junction,
  phaseAt,
  trafficAt,
  urbanDrive,
  urbanSpawn,
  type UrbanId,
} from "../src/features/drive/urban";

describe("urban intersection conflicts", () => {
  it("runs opposing traffic and crossing pedestrians together during green, even while the player waits", () => {
    const car = urbanSpawn();
    for (let i = 0; i < 17 * 60; i++)
      urbanDrive(car, neutral(), 1 / 60, "avenue");
    expect(car.z).toBe(0);
    expect(phaseAt(car.elapsed)).toEqual({ vehicle: "green", walk: "green" });
    const actors = trafficAt("avenue", car.elapsed);
    expect(actors.people.some((p) => p.walking)).toBe(true);
    expect(actors.cars.some((c) => c.z > junction.z)).toBe(true);
  });
  it("evaluates red and amber entry once, including the safe-stopping exception", () => {
    const car = () => ({
      ...urbanSpawn(),
      speed: 3,
      z: junction.line - 2 - 0.005,
    });
    const red = car();
    urbanDrive(red, neutral(), 0.02, "market");
    expect(red.result).toBe("red");
    const close = { ...car(), elapsed: 29.99 };
    urbanDrive(close, neutral(), 0.02, "market");
    expect(close.entered).toBe(true);
    const distant = { ...car(), z: 17, elapsed: 29.99 };
    urbanDrive(distant, neutral(), 0.02, "market");
    distant.z = junction.line - 2;
    urbanDrive(distant, neutral(), 0.02, "market");
    expect(distant.result).toBe("amber");
    const inside = { ...car(), entered: true, elapsed: 33.1 };
    urbanDrive(inside, neutral(), 0.02, "avenue");
    expect(inside.result).toBeNull();
  });
  it("distinguishes an oncoming vehicle from a pedestrian still crossing after the traffic gap opens", () => {
    const turn = { ...urbanSpawn(), entered: true, z: 46, yaw: Math.PI / 2 };
    const oncoming = { ...turn, x: 0.3, elapsed: 10 };
    urbanDrive(oncoming, neutral(), 0.02, "avenue");
    expect(oncoming.result).toBe("opposing");
    const pedestrian = { ...turn, x: 9.2, elapsed: 21.5 };
    urbanDrive(pedestrian, neutral(), 0.02, "avenue");
    expect(pedestrian.result).toBe("walk");
    const empty = { ...turn, x: 9.2, elapsed: 10 };
    urbanDrive(empty, neutral(), 0.02, "station");
    expect(phaseAt(empty.elapsed).walk).toBe("green");
    expect(empty.result).toBeNull();
  });
  it("allows a vehicle already turning to clear the junction when opposing traffic is stopped", () => {
    const car = {
      ...urbanSpawn(),
      x: 1,
      z: 47,
      yaw: Math.PI / 2,
      entered: true,
      elapsed: 6.5,
    };
    urbanDrive(car, neutral(), 0.02, "avenue");
    expect(car.result).toBeNull();
  });
  it("checks the stop sign on the next civic block after the signal-controlled turn", () => {
    const car = {
      ...urbanSpawn(),
      x: junction.secondaryLine - 1.9,
      z: 47,
      yaw: Math.PI / 2,
      entered: true,
      elapsed: 34,
    };
    urbanDrive(car, neutral(), 0.02, "avenue");
    expect(car.result).toBe("stop");
  });
  it.each([
    ...(Object.keys(districts) as UrbanId[]).map((id) => ({ id, variant: 0 })),
    { id: "avenue" as const, variant: 1 },
    { id: "avenue" as const, variant: 2 },
  ])(
    "can drive $id encounter $variant through a legal ninety-degree turn to the destination",
    ({ id, variant }) => {
      const car = urbanSpawn(id, variant),
        s = districts[id].turn,
        radius = s === 1 ? 9 : 7;
      const endZ = junction.z + s * 3,
        startZ = endZ - radius;
      const path: { x: number; z: number }[] = [];
      for (let z = 0; z < startZ; z += 0.3)
        path.push({
          x: id === "lanes" ? -4.5 + Math.min(1, z / 18) * 2.85 : -3,
          z,
        });
      for (let a = 0; a <= Math.PI / 2; a += 0.025)
        path.push({
          x: -3 + s * radius * (1 - Math.cos(a)),
          z: startZ + radius * Math.sin(a),
        });
      for (let i = 0; i < 65; i += 0.3)
        path.push({ x: -3 + s * (radius + i), z: endZ });
      let cursor = 0,
        waited = false;
      for (let i = 0; i < 7200 && !car.result; i++) {
        while (
          cursor < path.length - 1 &&
          Math.hypot(path[cursor].x - car.x, path[cursor].z - car.z) < 3.2
        )
          cursor++;
        const goal = path[cursor],
          error = Math.atan2(goal.x - car.x, goal.z - car.z) - car.yaw;
        const input = neutral();
        input.left = error < -0.019;
        input.right = error > 0.019;
        const stop =
          car.elapsed < 26 &&
          !car.entered &&
          junction.line - car.z - 2 <
            2 + car.speed ** 2 / (id === "snow" ? 6 : 14);
        const sideStop =
          id === "avenue" &&
          !car.stopped &&
          car.x > 15 &&
          junction.secondaryLine - car.x - 2 < 1.8 + car.speed ** 2 / 14;
        const vanStop =
          id === "delivery" &&
          car.z < 23 &&
          car.elapsed < (car.encounterAt ?? 0) + 12 &&
          20 - car.z < 1.5 + car.speed ** 2 / 14;
        const winterStop =
          id === "snow" &&
          car.elapsed < (car.encounterAt ?? 0) + 12 &&
          19 - car.z < 2 + car.speed ** 2 / 6;
        input.brake = stop || sideStop || vanStop || winterStop;
        input.gas = !input.brake && car.speed < 4.5;
        waited ||= stop && car.speed === 0;
        urbanDrive(car, input, 1 / 60, id);
      }
      expect(car.result, JSON.stringify(car)).toBe("complete");
      expect(waited).toBe(true);
    },
  );
});
