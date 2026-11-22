import { expect, it } from "vitest";
import {
  course,
  drive,
  laneX,
  neutral,
  spawn,
} from "../src/features/drive/simulation";
it("drives the entire course using only steering and pedals", () => {
  const car = spawn();
  for (let i = 0; i < 8000 && !car.result; i++) {
    const keys = neutral(),
      targetZ = car.z + 5;
    const desiredYaw = Math.atan2(laneX(targetZ) - car.x, 5),
      error = desiredYaw - car.yaw;
    keys.left = error < -0.018;
    keys.right = error > 0.018;
    const distance =
      (!car.stopped
        ? course.stop
        : !car.crossed
          ? course.crossing - 2
          : Infinity) -
      car.z -
      2;
    const waiting = car.crossed && car.pedTime < 5;
    keys.brake = waiting || distance <= 2 + (car.speed * car.speed) / 14;
    keys.gas = !keys.brake && car.speed < 5;
    drive(car, keys, 1 / 60);
  }
  expect(car.result).toBe("complete");
  expect(car.stopped && car.crossed).toBe(true);
});
it("requires a complete stop and keeps a moving pedestrian protected", () => {
  const car = spawn();
  Object.assign(car, { x: laneX(40), z: 40, speed: 1 });
  drive(car, neutral(), 0.05);
  expect(car.result).toBe("stop");
  const approach = spawn();
  Object.assign(approach, { x: laneX(89), z: 89, stopped: true });
  drive(approach, neutral(), 0.05);
  expect(approach.crossed).toBe(true);
  for (let i = 0; i < 80 && !approach.result; i++)
    drive(approach, { ...neutral(), gas: true }, 0.05);
  expect(approach.result).toBe("yield");
});
it("braking takes precedence and a lane departure ends the run", () => {
  const car = spawn();
  drive(car, { ...neutral(), gas: true, brake: true }, 0.05);
  expect(car.speed).toBe(0);
  car.x = 8;
  drive(car, neutral(), 0.05);
  expect(car.result).toBe("curb");
  const lane = spawn();
  lane.x = 1;
  for (let i = 0; i < 30; i++) drive(lane, neutral(), 0.05);
  expect(lane.result).toBe("lane");
});
