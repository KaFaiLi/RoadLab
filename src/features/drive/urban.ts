import { tr } from "../../content/schema";
import { advanceVehicle, spawn, type Car, type Controls } from "./simulation";

export type UrbanId = "market" | "station" | "avenue";
export type RouteId = "town" | UrbanId;
export type District = {
  turn: -1 | 1;
  departures: number[];
  walkStarts: number[];
  facade: string;
  name: ReturnType<typeof tr>;
  brief: ReturnType<typeof tr>;
};
export const districts: Record<UrbanId, District> = {
  market: {
    turn: -1,
    departures: [],
    walkStarts: [10, 16],
    facade: "#cc7759",
    name: tr("Market street · left turn", "市場街・左轉", "商店街・左折"),
    brief: tr(
      "Turn left at the shops. The exit crossing has its own walk signal. Look for the second shopper before moving.",
      "在商店街左轉。出口有行人號誌，起步前也要留意第二位行人。",
      "商店街で左折。出口の歩行者信号と、後から渡る買い物客にも注意しましょう。",
    ),
  },
  station: {
    turn: 1,
    departures: [8, 13, 18],
    walkStarts: [],
    facade: "#557b8f",
    name: tr("Station road · right turn", "車站路・右轉", "駅前通り・右折"),
    brief: tr(
      "Turn right toward the station. Oncoming vehicles have green at the same time as you. Find a gap that lets them continue straight.",
      "向車站右轉。對向直行車與你同時亮綠燈，請在不妨礙來車的空檔轉彎。",
      "駅方面へ右折。対向車も同時に青信号です。直進車を妨げずに曲がれる間隔を見極めましょう。",
    ),
  },
  avenue: {
    turn: 1,
    departures: [8, 16],
    walkStarts: [12, 19],
    facade: "#729582",
    name: tr(
      "Civic avenue · mixed traffic",
      "市政大道・複合路況",
      "市役所通り・複合交通",
    ),
    brief: tr(
      "Turn right at the civic centre. Check the opposing lane first, then the exit crossing. A gap in traffic can open while someone is still walking.",
      "在市政中心右轉。先確認對向車道，再確認出口穿越道；來車出現空檔時仍可能有人正在過街。",
      "市役所前を右折。対向車線と出口の横断歩道を順に確認します。対向車が途切れても歩行者がまだ横断中のことがあります。",
    ),
  },
};
export const junction = {
  z: 44,
  half: 6,
  line: 34,
  cross: 12,
  finish: 52,
  cycle: 42,
  sideStreet: 36,
  secondaryLine: 31,
};
export function urbanSpawn() {
  return { ...spawn(), x: -3 };
}
export function phaseAt(time: number) {
  const t = time % junction.cycle;
  return {
    vehicle: t < 8 || t >= 33 ? "red" : t < 30 ? "green" : "amber",
    walk: t < 8 || t >= 29 ? "red" : t < 26 ? "green" : "flash",
  } as const;
}
export function trafficAt(route: UrbanId, time: number) {
  const cfg = districts[route],
    t = time % junction.cycle;
  // Cars traverse the opposing stop line on green. Later arrivals queue behind the first.
  const cars = cfg.departures
    .map((departure, i) => {
      const startZ = junction.z + 12.5 + i * 9;
      const approach = Math.max(0, departure - t - 2) * 3;
      return {
        x: 3,
        movingThrough: t > departure,
        z: startZ + approach - Math.max(0, t - departure) * 5.4,
        color: i % 2 ? "#c7784d" : "#4a809b",
      };
    })
    .filter((v) => v.z > -24 && v.z < 113);
  const people = cfg.walkStarts
    .map((start, i) => {
      const age = t - start,
        progress = Math.max(0, Math.min(1, age / 8));
      return {
        x: cfg.turn * junction.cross + (i % 2 ? 0.38 : -0.38),
        z: junction.z + (i % 2 ? -1 : 1) * (-6.65 + 13.3 * progress),
        crossing: age >= -0.7 && age < 8,
        walking: age >= 0 && age < 8,
        color: i % 2 ? "#678db6" : "#d99742",
      };
    })
    .filter((_, i) => t >= cfg.walkStarts[i] - 3 && t < cfg.walkStarts[i] + 10);
  return { cars, people };
}
export function urbanProgress(car: Car, id: UrbanId) {
  // Join approach and exit progress at the turn. Both lane offsets count toward the same endpoint.
  if (car.result === "complete") return junction.z + junction.finish;
  const side = districts[id].turn * car.x;
  if (side <= 3) return Math.max(0, Math.min(junction.z, car.z));
  const exitZ = junction.z + districts[id].turn * 3;
  return Math.min(
    junction.z + junction.finish,
    (Math.max(0, car.z) / exitZ) * junction.z +
      ((side - 3) * junction.finish) / (junction.finish - 3),
  );
}
export function urbanDrive(car: Car, keys: Controls, dt: number, id: UrbanId) {
  if (car.result) return;
  dt = Math.min(0.05, Math.max(0, dt));
  const before = phaseAt(car.elapsed).vehicle;
  const previousNose = car.z + 2 * Math.cos(car.yaw);
  car.elapsed += dt;
  const phase = phaseAt(car.elapsed).vehicle;
  if (phase === "amber" && before !== "amber")
    car.amberPass =
      junction.line - previousNose <= car.speed * 0.7 + car.speed ** 2 / 10;
  advanceVehicle(car, keys, dt, 0.44);
  const turn = districts[id].turn,
    noseZ = car.z + 2 * Math.cos(car.yaw),
    noseX = car.x + 2 * Math.sin(car.yaw),
    side = turn * noseX;
  const { cars, people } = trafficAt(id, car.elapsed);
  if (!car.entered && noseZ >= junction.line) {
    if (phase === "red" || (phase === "amber" && !car.amberPass)) {
      car.result = phase;
      return;
    }
    car.entered = true;
  }
  const dz = car.z - junction.z;
  if (
    (Math.abs(car.x) > junction.half - 0.65 &&
      Math.abs(dz) > junction.half - 0.65 &&
      Math.abs(car.x) + Math.abs(dz) > 2 * junction.half + 1.3) ||
    car.z < -3
  ) {
    car.result = "curb";
    return;
  }
  if (dz > junction.half + 4 || turn * car.x < -junction.half - 2) {
    car.result = "wrongTurn";
    return;
  }
  const wrongLane =
    dz < -junction.half - 1
      ? car.x > -0.35
      : Math.abs(car.x) > junction.half + 1
        ? turn * dz < 0.35
        : false;
  car.offLane = wrongLane ? car.offLane + dt : 0;
  if (car.offLane > 1) {
    car.result = "lane";
    return;
  }
  if (
    turn === 1 &&
    noseX > 1.25 &&
    car.x < 5.1 &&
    Math.abs(dz) < 7 &&
    cars.some((v) => v.movingThrough && v.z > car.z - 3 && v.z < car.z + 11)
  ) {
    car.result = "opposing";
    return;
  }
  if (
    side >= junction.cross - 1.15 &&
    turn * car.x < junction.cross + 1.5 &&
    people.some((p) => p.crossing)
  ) {
    car.result = "walk";
    return;
  }
  if (
    id === "avenue" &&
    !car.stopped &&
    side >= junction.secondaryLine - 4 &&
    side <= junction.secondaryLine &&
    car.speed === 0
  )
    car.stopped = true;
  if (id === "avenue" && !car.stopped && side > junction.secondaryLine) {
    car.result = "stop";
    return;
  }
  if (car.entered && turn * car.x >= junction.finish && turn * dz > 0.35)
    car.result = "complete";
}
