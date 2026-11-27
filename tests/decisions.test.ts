import { describe, expect, it } from "vitest";
import { neutral, advanceVehicle } from "../src/features/drive/simulation";
import { trafficAt, urbanSpawn, urbanDrive } from "../src/features/drive/urban";
import { assessLesson, lessonActors } from "../src/features/drive/encounters";
import { historySchema } from "../src/lib/game";

describe("driving decisions", () => {
  it("replays the same schedule and offers three different clearance orders", () => {
    const schedules = [0, 1, 2].map((v) => trafficAt("avenue", 17, v));
    expect(schedules[0]).toEqual(trafficAt("avenue", 17, 0));
    expect(schedules[0].lastCarAt!).toBeLessThan(schedules[0].lastWalkAt!);
    expect(schedules[1].lastWalkAt!).toBeLessThan(schedules[1].lastCarAt!);
    expect(schedules[2].lastWalkAt).toBeNull();
  });
  it("lets the player wait before the crossing, proceed after their lane clears and clear before a new arrival", () => {
    const approach = {
      ...urbanSpawn(),
      entered: true,
      z: 47,
      yaw: Math.PI / 2,
      x: 8,
      elapsed: 21,
    };
    urbanDrive(approach, neutral(), 0.02, "avenue");
    expect(approach.result).toBeNull();
    expect(approach.events.some((e) => e.key === "walkWait")).toBe(true);
    const farSide = { ...approach, x: 9.4, elapsed: 25 };
    urbanDrive(farSide, neutral(), 0.02, "avenue");
    expect(farSide.result).toBeNull();
    const past = { ...approach, x: 15.5, elapsed: 19 };
    urbanDrive(past, neutral(), 0.02, "avenue");
    expect(past.result).toBeNull();
  });
  it("records what happened when a traffic gap opened, without awarding an unobserved wait", () => {
    const car = {
      ...urbanSpawn(),
      z: 30,
      elapsed: trafficAt("avenue", 0).lastCarAt! - 0.01,
    };
    urbanDrive(car, neutral(), 0.02, "avenue");
    expect(car.events.map((e) => e.key)).toEqual(["lastCarWhileWalking"]);
  });
  it("requires sufficient room beyond the station crossing on green", () => {
    const car = { ...urbanSpawn(), elapsed: 13, z: 32.1 };
    urbanDrive(car, neutral(), 0.02, "queue");
    expect(car.result).toBe("queue");
    const clear = { ...urbanSpawn(), elapsed: 25, z: 32.1 };
    urbanDrive(clear, neutral(), 0.02, "queue");
    expect(clear.entered).toBe(true);
  });
  it("reveals the shopper behind the van and distinguishes a cyclist alongside from one already past", () => {
    const car = { ...urbanSpawn(), encounterAt: 2, elapsed: 7, z: 21 };
    expect(lessonActors("delivery", car).walker!.x).toBeLessThan(-3);
    expect(assessLesson("delivery", car, 23)).toBe("walk");
    const bike = {
      ...urbanSpawn(),
      encounterAt: 3,
      elapsed: 12,
      z: 35,
      x: -4.6,
    };
    expect(assessLesson("cycle", bike, 36)).toBe("bike");
    bike.elapsed += 7;
    expect(assessLesson("cycle", bike, 36)).toBeNull();
  });
  it("checks the lane and right arrow independently", () => {
    for (const [x, t, allowed] of [
      [-4.5, 16, false],
      [-1.5, 9, false],
      [-1.5, 16, true],
    ] as const) {
      const car = { ...urbanSpawn("lanes"), x, z: 32.1, elapsed: t };
      urbanDrive(car, neutral(), 0.02, "lanes");
      expect(car.entered).toBe(allowed);
      if (allowed)
        expect(car.events.some((e) => e.key === "arrowLane")).toBe(true);
      else expect(car.result).toBe("arrow");
    }
  });
  it("reduces braking on snow and checks actual space to the lead car", () => {
    const dry = { ...urbanSpawn(), speed: 7 },
      snow = { ...urbanSpawn(), speed: 7 };
    advanceVehicle(dry, { ...neutral(), brake: true }, 0.05);
    advanceVehicle(snow, { ...neutral(), brake: true }, 0.05, 0.44, 0.44);
    expect(snow.speed).toBeGreaterThan(dry.speed);
    const car = { ...urbanSpawn(), encounterAt: 1, elapsed: 8, z: 22 };
    expect(assessLesson("snow", car, 24)).toBe("rear");
  });
  it("imports older progress and keeps driving skills independent from quiz attempts", () => {
    const old = { version: 1, attempts: [], locale: "en", last: null };
    expect(historySchema.parse(old)).toEqual(old);
    const next = {
      ...old,
      drives: [
        {
          route: "avenue",
          variant: 1,
          at: 8,
          completed: true,
          skills: ["walkWait"],
        },
      ],
    };
    expect(historySchema.parse(next)).toEqual(next);
  });
});
