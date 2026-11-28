import { fieldDrives, type FieldDrive } from "../../content/fieldDrives";
import { shuffle } from "../../lib/game";
import {
  districts,
  junction,
  urbanSpawn,
  urbanDrive,
  type RouteId,
  type UrbanId,
} from "./urban";
import {
  course,
  spawn,
  drive,
  roadX,
  type Controls,
  type Result,
} from "./simulation";
import { fieldDrive, fieldFinish, fieldSpawn, fieldX } from "./field";
import { makeWorld, townPedestrian, type Face, type V } from "./world";
import { urbanWorld, urbanActors } from "./urbanWorld";
import { fieldWorld, fieldActors } from "./fieldWorld";
import { note } from "./encounters";
import { skillText, type Skill } from "../../content/drivingLessons";

import { newTraffic, moveTraffic, trafficMesh } from "./roadTraffic";
export type Street = { route: RouteId; field?: FieldDrive; variant: number };
export function streetPicker(random = Math.random) {
  const weather =
    fieldDrives[Math.floor(random() * fieldDrives.length)].weather;
  const pool: Street[] = [
    { route: "town", variant: 0 },
    ...(Object.keys(districts) as UrbanId[]).map((route) => ({
      route,
      variant: 0,
    })),
    ...fieldDrives.map((field) => ({
      field,
      route: "town" as const,
      variant: 0,
    })),
  ];
  let deck: Street[] = [],
    last: Street | undefined;
  return () => {
    if (!deck.length) {
      deck = shuffle(pool, random);
      if (deck.at(-1) === last)
        [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
    }
    const street = deck.pop()!;
    last = street;
    const field = street.field;
    return {
      ...street,
      weather,
      variant: street.route === "avenue" ? Math.floor(random() * 3) : 0,
      field: field
        ? {
            ...field,
            weather:
              field.group === "winter" && weather !== "snow" ? "ice" : weather,
            signalOffset: Math.floor(random() * 36),
            positions: [0, 1, 2].map(
              (i) => 38 + i * 54 + Math.round(random() * 16) - 8,
            ),
          }
        : undefined,
    };
  };
}
function newCar(s: Street) {
  return s.field
    ? fieldSpawn()
    : s.route === "town"
      ? spawn()
      : urbanSpawn(s.route, s.variant);
}
function exit(s: Street) {
  if (s.route !== "town") {
    const turn = districts[s.route].turn;
    return { x: turn * junction.finish, z: junction.z, cos: 0, sin: turn };
  }
  const z = (s.field ? fieldFinish : course.finish) - 2;
  return { x: s.field ? fieldX(s.field, z) : roadX(z), z, cos: 1, sin: 0 };
}
function localPoint(point: V, end: ReturnType<typeof exit>): V {
  const dx = point[0] - end.x,
    dz = point[2] - end.z;
  return [dx * end.cos - dz * end.sin, point[1], dx * end.sin + dz * end.cos];
}
function worldPoint([x, y, z]: V, end: ReturnType<typeof exit>): V {
  return [
    end.x + x * end.cos + z * end.sin,
    y,
    end.z - x * end.sin + z * end.cos,
  ];
}
function clip(mesh: Face[], distance: (v: V) => number) {
  return mesh.flatMap((f) => {
    const vertices: V[] = [];
    for (let i = 0; i < f.v.length; i++) {
      const a = f.v[i],
        b = f.v[(i + 1) % f.v.length],
        da = distance(a),
        db = distance(b);
      if (da >= 0) vertices.push(a);
      if (da < 0 !== db < 0) {
        const t = da / (da - db);
        vertices.push([
          a[0] + t * (b[0] - a[0]),
          a[1] + t * (b[1] - a[1]),
          a[2] + t * (b[2] - a[2]),
        ]);
      }
    }
    return vertices.length >= 3 ? [{ ...f, v: vertices }] : [];
  });
}
function streetMesh(s: Street) {
  const mesh = s.field
    ? fieldWorld(s.field)
    : s.route === "town"
      ? makeWorld()
      : urbanWorld(s.route);
  const end = exit(s);
  return clip(
    clip(mesh, (v) => v[2]),
    (v) => -localPoint(v, end)[2],
  );
}
const transform = (faces: Face[], fn: (p: V) => V) =>
  faces.map((f) => ({ ...f, v: f.v.map(fn) }));
export function createJourney(random = Math.random) {
  const pick = streetPicker(random),
    street = pick(),
    next = pick();
  const currentMesh = streetMesh(street),
    nextMesh = streetMesh(next),
    end = exit(street);
  const car = newCar(street);
  return {
    pick,
    street,
    next,
    car,
    previewCar: newCar(next),
    traffic: newTraffic(street.field),
    previewTraffic: newTraffic(next.field),
    currentMesh,
    nextMesh,
    world: [...currentMesh, ...transform(nextMesh, (p) => worldPoint(p, end))],
    distance: 0,
    streets: 0,
    incidents: 0,
    time: 0,
    skills: new Set<Skill>(),
    warning: null as Result | null,
    warningUntil: 0,
    history: [{ ...car, events: [...car.events] }],
    sampleAt: 0,
  };
}
export type Journey = ReturnType<typeof createJourney>;
function nearExit(j: Journey) {
  const end = exit(j.street);
  return Math.hypot(j.car.x - end.x, j.car.z - end.z) < 75;
}
export function journeyWorld(j: Journey) {
  const moving = j.street.field ? trafficMesh(j.traffic, j.street.field) : [];
  if (!nearExit(j)) return moving.length ? [...j.world, ...moving] : j.world;
  const s = j.next,
    c = j.previewCar,
    end = exit(j.street);
  const actors = s.field
    ? fieldActors(s.field, c)
    : s.route === "town"
      ? townPedestrian(c)
      : urbanActors(s.route, c);
  if (s.field) actors.push(...trafficMesh(j.previewTraffic, s.field));
  return [
    ...j.world,
    ...moving,
    ...transform(actors, (p) => worldPoint(p, end)),
  ];
}
export function advanceJourney(
  j: Journey,
  keys: Controls,
  dt: number,
  look = 0,
) {
  const { street: s, car } = j;
  const beforeX = car.x,
    beforeZ = car.z;
  const delta = Math.max(0, Math.min(0.05, dt));
  j.time += delta;
  if (nearExit(j)) {
    j.previewCar.elapsed += delta;
    if (j.next.field)
      moveTraffic(j.previewTraffic, j.next.field, j.previewCar, delta);
  }
  if (s.field) {
    moveTraffic(j.traffic, s.field, car, delta);
    fieldDrive(car, keys, dt, s.field);
    if (
      !car.result &&
      Math.abs(car.z - j.traffic.z) < 3.9 &&
      Math.abs(car.x - fieldX(s.field, j.traffic.z) - 2.65) < 1.6
    )
      car.result = "trafficContact";
  } else if (s.route === "town") {
    drive(car, keys, dt);
    if (car.stopped) note(car, "sideStop");
    if (car.crossed) note(car, "walkWait");
  } else {
    const turn = districts[s.route].turn;
    if (car.z > 22 && turn * car.x < 9 && turn * look > 0.6)
      note(car, "looked");
    urbanDrive(car, keys, dt, s.route);
  }
  j.distance += Math.hypot(car.x - beforeX, car.z - beforeZ);
  for (const event of car.events)
    if (Object.hasOwn(skillText, event.key)) j.skills.add(event.key as Skill);
  if (car.result === "complete") {
    const end = exit(s),
      [x, , z] = localPoint([car.x, 0, car.z], end);
    j.street = j.next;
    j.next = j.pick();
    const previous = transform(j.currentMesh, (p) => localPoint(p, end));
    j.currentMesh = j.nextMesh;
    j.nextMesh = streetMesh(j.next);
    const nextExit = exit(j.street);
    j.world = [
      ...previous,
      ...j.currentMesh,
      ...transform(j.nextMesh, (p) => worldPoint(p, nextExit)),
    ];
    const leftEdge =
      j.street.route === "town" && !j.street.field ? -3.65 : -4.55;
    j.car = {
      ...j.previewCar,
      x: Math.max(leftEdge, Math.min(-0.5, x)),
      z,
      speed: car.speed,
      steer: car.steer,
      yaw: Math.atan2(
        Math.sin(car.yaw - Math.atan2(end.sin, end.cos)),
        Math.cos(car.yaw - Math.atan2(end.sin, end.cos)),
      ),
    };
    j.traffic = j.previewTraffic;
    j.previewTraffic = newTraffic(j.next.field);
    j.previewCar = newCar(j.next);
    j.streets++;
    j.history = [{ ...j.car, events: [] }];
    j.sampleAt = j.time;
  } else if (car.result) {
    j.warning = car.result;
    j.warningUntil = j.time + 5;
    j.incidents++;
    const safe = j.history[0];
    j.car = {
      ...safe,
      elapsed: car.elapsed,
      events: [...safe.events],
      speed: 0,
      steer: 0,
      result: null,
    };
    j.history = [{ ...j.car }];
    j.sampleAt = j.time;
  } else if (j.time - j.sampleAt >= 0.65) {
    j.history.push({ ...car, events: [...car.events] });
    if (j.history.length > 5) j.history.shift();
    j.sampleAt = j.time;
  }
}
