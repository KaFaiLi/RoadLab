import { note, assessLesson, arrowOn } from "./encounters";
import { tr } from "../../content/schema";
import { advanceVehicle, spawn, type Car, type Controls } from "./simulation";

export type UrbanId =
  | "market"
  | "station"
  | "avenue"
  | "queue"
  | "delivery"
  | "cycle"
  | "lanes"
  | "snow";
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
  queue: {
    turn: 1,
    departures: [],
    walkStarts: [],
    facade: "#737eae",
    name: tr(
      "Station exit · blocked crossing",
      "車站出口・回堵",
      "駅出口・渋滞",
    ),
    brief: tr(
      "Turn right. Watch the lead car creep forward. Enter only when your whole car can fit beyond the crossing.",
      "右轉。前車緩慢移動，確認穿越道後有空間容納整輛車再進入。",
      "右折します。前の車が動いても、横断歩道の先に自車が収まるまで待ちましょう。",
    ),
  },
  delivery: {
    turn: -1,
    departures: [],
    walkStarts: [],
    facade: "#b7774d",
    name: tr(
      "Shopping street · hidden crossing",
      "商店街・視線受阻",
      "商店街・死角の横断歩道",
    ),
    brief: tr(
      "A parked van hides an unsignalised crossing before the junction. Slow on approach, yield to the shopper, then turn left at the lights.",
      "路口前貨車遮住無號誌穿越道。提早減速並禮讓行人，再於號誌左轉。",
      "交差点手前の無信号横断歩道が配送車の陰にあります。減速して歩行者を待ち、信号で左折しましょう。",
    ),
  },
  cycle: {
    turn: -1,
    departures: [],
    walkStarts: [],
    facade: "#739762",
    name: tr(
      "Riverside · left-side cyclist",
      "河畔・左側自行車",
      "川沿い・左側の自転車",
    ),
    brief: tr(
      "A cyclist approaches from behind on the left. Use the left mirror and hold Look left for a shoulder check before turning.",
      "自行車從左後方接近。請看左後視鏡，按住向左看回頭確認再轉彎。",
      "自転車が左後方から接近します。左ミラーと左確認の長押しで安全を確認して左折しましょう。",
    ),
  },
  lanes: {
    turn: 1,
    departures: [],
    walkStarts: [],
    facade: "#587c95",
    name: tr(
      "Boulevard · right-turn arrow",
      "大道・右轉箭頭",
      "大通り・右折矢印",
    ),
    brief: tr(
      "Move into the lane marked for right turns before the solid divider. At the red light, watch for the separate right arrow.",
      "實線前進入指定右轉道。紅燈時留意獨立的右轉箭頭。",
      "実線の手前で右折指定車線へ。赤信号に併設された右矢印を確認しましょう。",
    ),
  },
  snow: {
    turn: 1,
    departures: [],
    walkStarts: [],
    facade: "#8095a1",
    name: tr(
      "Hokkaido · snowy approach",
      "北海道・雪地路口",
      "北海道・雪の交差点",
    ),
    brief: tr(
      "Packed snow reduces grip. The car ahead slows near the crossing. Leave braking space, then turn right at the junction.",
      "壓雪降低抓地力。前車在穿越道前減速，保留煞車空間，再於路口右轉。",
      "圧雪で滑りやすい路面です。横断歩道手前で減速する前車との車間を確保して、交差点を右折しましょう。",
    ),
  },
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
export function urbanSpawn(id?: UrbanId, variant = 0) {
  return { ...spawn(), variant, x: id === "lanes" ? -4.5 : -3 };
}
export function phaseAt(time: number) {
  const t = time % junction.cycle;
  return {
    vehicle: t < 8 || t >= 33 ? "red" : t < 30 ? "green" : "amber",
    walk: t < 8 || t >= 29 ? "red" : t < 26 ? "green" : "flash",
  } as const;
}
export function trafficAt(route: UrbanId, time: number, variant = 0) {
  const cfg = districts[route],
    t = time % junction.cycle;
  // Cars traverse the opposing stop line on green. Later arrivals queue behind the first.
  const departures =
    route === "avenue" && variant === 1 ? [11, 22] : cfg.departures;
  const starts =
    route === "avenue"
      ? [cfg.walkStarts, [8], []][variant % 3]
      : cfg.walkStarts;
  const cars = departures
    .map((departure, i) => {
      const startZ = junction.z + 12.5 + i * 9;
      const approach = Math.max(0, departure - t - 2) * 3;
      return {
        x: 3,
        vz: t > departure ? -5.4 : 0,
        movingThrough: t > departure,
        z: startZ + approach - Math.max(0, t - departure) * 5.4,
        color: i % 2 ? "#c7784d" : "#4a809b",
      };
    })
    .filter((v) => v.z > -24 && v.z < 113);
  const people = starts
    .map((start, i) => {
      const age = t - start,
        progress = Math.max(0, Math.min(1, age / 8));
      return {
        x: cfg.turn * junction.cross + (i % 2 ? 0.38 : -0.38),
        z: junction.z + (i % 2 ? -1 : 1) * (-6.65 + 13.3 * progress),
        vz: age >= 0 && age < 8 ? ((i % 2 ? -1 : 1) * 13.3) / 8 : 0,
        crossing: age >= -0.7 && age < 8,
        walking: age >= 0 && age < 8,
        color: i % 2 ? "#678db6" : "#d99742",
      };
    })
    .filter((_, i) => t >= starts[i] - 3 && t < starts[i] + 10);
  const lastIndex = departures.length - 1;
  const lastCarAt =
    lastIndex < 0
      ? null
      : departures[lastIndex] + (12.5 + lastIndex * 9 + 2 - 3) / 5.4;
  const lastWalkAt = starts.length ? starts[starts.length - 1] + 8 : null;
  return { cars, people, lastCarAt, lastWalkAt };
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
  if (car.encounterAt === null && car.z >= 5) car.encounterAt = car.elapsed;
  advanceVehicle(car, keys, dt, 0.44, id === "snow" ? 0.44 : 1);
  const turn = districts[id].turn,
    noseZ = car.z + 2 * Math.cos(car.yaw),
    noseX = car.x + 2 * Math.sin(car.yaw),
    side = turn * noseX;
  const { cars, people, lastCarAt, lastWalkAt } = trafficAt(
    id,
    car.elapsed,
    car.variant,
  );
  const lessonResult = assessLesson(id, car, noseZ);
  if (lessonResult) {
    car.result = lessonResult;
    return;
  }
  if (
    !car.entered &&
    noseZ >= 27 &&
    car.speed === 0 &&
    (id === "lanes" ? !arrowOn(car.elapsed) : phase === "red")
  )
    note(car, "lightWait");
  if (!car.entered && noseZ >= junction.line) {
    if (id === "lanes") {
      if (!arrowOn(car.elapsed)) {
        car.result = "arrow";
        return;
      }
      note(car, "arrowLane");
    } else if (phase === "red" || (phase === "amber" && !car.amberPass)) {
      car.result = phase;
      return;
    }
    car.entered = true;
    note(car, "enteredJunction");
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
  // Estimate occupancy of the opposing lane from the moving car's length and speed.
  const clearingTime = Math.min(
    2.4,
    Math.max(0.65, (5.1 - car.x) / Math.max(2, car.speed)),
  );
  const oncoming = cars.some(
    (v) =>
      v.movingThrough &&
      v.z + 2 > car.z - 1 &&
      v.z - 2 + v.vz * clearingTime < car.z + 1,
  );
  if (turn === 1 && Math.abs(dz) < 8 && oncoming) {
    if (noseX > 1.25 && car.x < 5.1) {
      car.result = "opposing";
      return;
    }
    if (car.entered && noseX <= 1.25 && car.speed === 0) note(car, "gapWait");
  }
  // Test the part of the stripes the player will occupy. Retire the gate once the rear has cleared.
  if (
    side < junction.cross + 4 &&
    !car.events.some((e) => e.key === "exitClear")
  ) {
    const laneZ = junction.z + 3 * turn;
    const horizon = Math.min(2.6, 4.6 / Math.max(1.5, car.speed));
    const conflict = people.some(
      (p) =>
        p.crossing &&
        Math.min(p.z, p.z + p.vz * horizon) < laneZ + 2.1 &&
        Math.max(p.z, p.z + p.vz * horizon) > laneZ - 2.1,
    );
    if (
      conflict &&
      car.entered &&
      side > junction.cross - 8 &&
      car.speed === 0 &&
      side < junction.cross - 1.15
    )
      note(car, "walkWait");
    if (
      conflict &&
      side >= junction.cross - 1.15 &&
      turn * car.x < junction.cross + 1.5
    ) {
      car.result = "walk";
      return;
    }
  }
  if (
    id === "avenue" &&
    car.z > 20 &&
    !car.events.some((e) => e.key === "exitClear")
  ) {
    const t = car.elapsed % 42;
    if (lastCarAt !== null && t >= lastCarAt && t - dt < lastCarAt)
      note(
        car,
        people.some((p) => p.walking) ? "lastCarWhileWalking" : "lastCar",
      );
    if (lastWalkAt !== null && t >= lastWalkAt && t - dt < lastWalkAt)
      note(car, "lastWalker");
  }
  if (turn * car.x > junction.cross + 3) note(car, "exitClear");
  if (
    id === "avenue" &&
    !car.stopped &&
    side >= junction.secondaryLine - 4 &&
    side <= junction.secondaryLine &&
    car.speed === 0
  ) {
    car.stopped = true;
    note(car, "sideStop");
  }
  if (id === "avenue" && !car.stopped && side > junction.secondaryLine) {
    car.result = "stop";
    return;
  }
  if (car.entered && turn * car.x >= junction.finish && turn * dz > 0.35)
    car.result = "complete";
}
