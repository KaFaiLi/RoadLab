// Coordinates and vehicle dimensions are metres. Positive Z is down the course.
export const course = { stop: 42, crossing: 94, finish: 150, halfWidth: 4.4 };
export const roadX = (z: number) =>
  2.9 * (1 - Math.cos(Math.max(0, z - 12) / 19));
export const laneX = (z: number) => roadX(z) - course.halfWidth / 2;
export type Controls = {
  gas: boolean;
  brake: boolean;
  left: boolean;
  right: boolean;
};
export const neutral = (): Controls => ({
  gas: false,
  brake: false,
  left: false,
  right: false,
});
export type Result =
  | "red"
  | "amber"
  | "opposing"
  | "walk"
  | "wrongTurn"
  | "stop"
  | "yield"
  | "lane"
  | "curb"
  | "complete";
export type Car = {
  elapsed: number;
  entered: boolean;
  amberPass: boolean;
  x: number;
  z: number;
  yaw: number;
  speed: number;
  steer: number;
  stopped: boolean;
  crossed: boolean;
  pedTime: number;
  offLane: number;
  result: Result | null;
};
export function spawn(): Car {
  return {
    elapsed: 0,
    entered: false,
    amberPass: false,
    x: laneX(0),
    z: 0,
    yaw: 0,
    speed: 0,
    steer: 0,
    stopped: false,
    crossed: false,
    pedTime: 0,
    offLane: 0,
    result: null,
  };
}
export const pedestrianX = (car: Car) =>
  roadX(course.crossing) - 5.1 + Math.min(car.pedTime / 5, 1) * 10.2;
export function drive(car: Car, keys: Controls, dt: number) {
  if (car.result) return;
  dt = Math.min(0.05, Math.max(0, dt));
  advanceVehicle(car, keys, dt);
  const offset = car.x - roadX(car.z);
  car.offLane = offset > -0.4 ? car.offLane + dt : 0;
  const nose = car.z + 2;
  if (Math.abs(offset) > course.halfWidth - 0.65 || car.z < -2) {
    car.result = "curb";
    return;
  }
  if (car.offLane > 1.1) {
    car.result = "lane";
    return;
  }
  if (
    !car.stopped &&
    nose >= course.stop - 5 &&
    nose <= course.stop &&
    car.speed === 0
  )
    car.stopped = true;
  if (!car.stopped && nose > course.stop) {
    car.result = "stop";
    return;
  }
  if (car.crossed) car.pedTime = Math.min(5, car.pedTime + dt);
  if (
    !car.crossed &&
    nose >= course.crossing - 7 &&
    nose <= course.crossing - 2 &&
    car.speed === 0
  )
    car.crossed = true;
  if (nose > course.crossing - 2 && (!car.crossed || car.pedTime < 5)) {
    car.result = "yield";
    return;
  }
  if (nose >= course.finish) car.result = "complete";
}

export function advanceVehicle(
  car: Car,
  keys: Controls,
  dt: number,
  steeringAngle = 0.36,
) {
  const target = Number(keys.right) - Number(keys.left);
  car.steer += (target - car.steer) * Math.min(1, dt * 6);
  car.speed = Math.max(
    0,
    Math.min(11.1, car.speed + dt * (keys.brake ? -7 : keys.gas ? 2.8 : -0.9)),
  );
  car.yaw += ((car.speed * Math.tan(car.steer * steeringAngle)) / 2.65) * dt;
  car.x += Math.sin(car.yaw) * car.speed * dt;
  car.z += Math.cos(car.yaw) * car.speed * dt;
}
