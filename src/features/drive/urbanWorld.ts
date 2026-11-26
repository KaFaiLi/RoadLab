import { box, face, type Face, type V } from "./world";
import { districts, junction, phaseAt, trafficAt, type UrbanId } from "./urban";
function surface(
  x: number,
  z: number,
  w: number,
  d: number,
  color: string,
  layer = 0,
) {
  return face(
    [
      [x - w / 2, 0.018 * layer, z - d / 2],
      [x + w / 2, 0.018 * layer, z - d / 2],
      [x + w / 2, 0.018 * layer, z + d / 2],
      [x - w / 2, 0.018 * layer, z + d / 2],
    ],
    color,
    layer,
  );
}
const J = junction.z;
export function urbanWorld(id: UrbanId) {
  const cfg = districts[id],
    mesh: Face[] = [];
  const ground = (
    x: number,
    z: number,
    w: number,
    d: number,
    c: string,
    layer = 0,
  ) => mesh.push(surface(x, z, w, d, c, layer));
  ground(0, J, 196, 184, "#b8b6a6");
  ground(0, J, 12, 184, "#49545a", 0.2);
  ground(0, J, 196, 12, "#49545a", 0.2);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      mesh.push(
        face(
          [
            [sx * 6, 0.005, J + sz * 6],
            [sx * 8.3, 0.005, J + sz * 6],
            [sx * 6, 0.005, J + sz * 8.3],
          ],
          "#49545a",
          0.2,
        ),
      );
    }
  if (id === "avenue") {
    ground(junction.sideStreet, J + 15, 6, 24, "#49545a", 0.2);
    ground(junction.secondaryLine, J + 3, 0.45, 5.6, "#fff4df", 0.65);
    const x = junction.secondaryLine,
      z = J + 6.65;
    mesh.push(...box(x, 0, z, 0.11, 2.7, 0.1, "#849391"));
    for (const [size, c, offset] of [
      [0.85, "#f8ecdf", 0],
      [0.76, "#cb433d", -0.04],
    ] as const)
      mesh.push(
        face(
          [
            [x + offset, 3.22, z - size],
            [x + offset, 3.22, z + size],
            [x + offset, 1.91, z],
          ],
          c,
        ),
      );
  }
  if (id === "station") {
    for (const x of [23, 31])
      mesh.push(...box(x, 0, J + 7.8, 0.15, 2.8, 0.15, "#476573"));
    mesh.push(
      ...box(27, 2.75, J + 7.8, 9, 0.22, 2.65, "#557b8f"),
      ...box(27, 0.53, J + 8.1, 4.8, 0.16, 0.6, "#987d5d"),
    );
  }
  mesh.push(
    ...box(-6.85, 0, 20, 0.14, 3.4, 0.14, "#667b7c"),
    ...box(-6.85, 2.8, 20, 3.45, 1.18, 0.16, "#2f617d"),
  );
  for (let m = -84; m < 86; m += 6) {
    if (Math.abs(m) < 9) continue;
    ground(0, J + m, 0.11, 2.6, "#efd997", 0.6);
    ground(m, J, 2.6, 0.11, "#efd997", 0.6);
    for (const side of [-1, 1]) {
      ground(side * 5.75, J + m, 0.09, 6, "#f0ecda", 0.5);
      ground(m, J + side * 5.75, 6, 0.09, "#f0ecda", 0.5);
    }
  }
  ground(-3, junction.line, 5.6, 0.48, "#fff4df", 0.65);
  ground(3, J + 10, 5.6, 0.48, "#fff4df", 0.65);
  for (const s of [-1, 1])
    for (let i = -5; i <= 5; i++) {
      ground(i, J + s * 8, 0.54, 2.15, "#f4eee2", 0.7);
      ground(s * junction.cross, J + i, 2.1, 0.54, "#f4eee2", 0.7);
    }
  // An ochre route arrow is painted on the approach and a green gate marks the exit.
  ground(-3, 24, 0.21, 2.6, "#fff1c9", 0.75);
  ground(-3 + cfg.turn * 0.53, 25.2, 1.2, 0.22, "#fff1c9", 0.75);
  const tip = -3 + cfg.turn * 1.6;
  mesh.push(
    face(
      [
        [tip, 0.02, 25.2],
        [tip - cfg.turn * 0.67, 0.02, 24.65],
        [tip - cfg.turn * 0.67, 0.02, 25.75],
      ],
      "#fff1c9",
      0.76,
    ),
  );
  const exitZ = J + cfg.turn * 3,
    exitX = cfg.turn * junction.finish;
  for (const end of [-1, 1])
    mesh.push(...box(exitX, 0, exitZ + end * 2.75, 0.18, 3.8, 0.16, "#3a6d61"));
  mesh.push(...box(exitX, 3.5, exitZ, 0.23, 0.5, 5.66, "#377965"));
  // Four city blocks frame the open junction. Street-facing shop bays rotate with the road.
  for (const axis of [0, 1])
    for (const side of [-1, 1])
      for (let i = -6; i <= 6; i++) {
        if (i === 0) continue;
        const along = i * 12.5,
          across = side * (11.6 + (Math.abs(i) % 2) * 0.7);
        const x = axis ? along : across,
          z = J + (axis ? across : along);
        if (
          axis &&
          (Math.abs(i) === 1 || (id === "avenue" && i === 3 && side === 1))
        )
          continue;
        const h =
          (id === "market" ? 4.1 : id === "station" ? 7 : 9) +
          (Math.abs(i * side + axis) % 3) * 2.3;
        const colors = ["#e0c9af", "#abc3c4", "#d3c5b4", "#c2cabf"];
        mesh.push(
          ...box(
            x,
            0,
            z,
            axis ? 8 : 6,
            h,
            axis ? 6 : 8,
            colors[Math.abs(i + axis) % 4],
          ),
        );
        const front = across - side * 3.07;
        function bay(
          y: number,
          offset: number,
          width: number,
          height: number,
          depth: number,
          color: string,
        ) {
          mesh.push(
            ...box(
              axis ? along + offset : front,
              y,
              axis ? J + front : J + along + offset,
              axis ? width : depth,
              height,
              axis ? depth : width,
              color,
            ),
          );
        }
        bay(2.6, 0, 7.6, 0.52, 0.7, cfg.facade);
        for (const o of [-2.5, 0, 2.5]) {
          bay(0.18, o, 1.85, 2.22, 0.14, "#4e686d");
          for (let y = 3.8; y < h - 0.7; y += 2.5)
            bay(y, o, 1.6, 0.95, 0.12, "#69858b");
        }
      }
  for (const [x, z] of [
    [7, J - 9],
    [-7, J + 9],
  ]) {
    mesh.push(
      ...box(x, 0, z, 0.17, 5.6, 0.17, "#526564"),
      ...box(x / 2, 5.43, z, Math.abs(x), 0.13, 0.13, "#526564"),
    );
  }
  // Pedestrian signals at each end face the crosswalk.
  for (const s of [-1, 1])
    mesh.push(
      ...box(cfg.turn * 12.9, 0, J + s * 6.7, 0.12, 2.65, 0.12, "#526564"),
    );
  return mesh;
}
function disc(x: number, y: number, z: number, r: number, color: string): Face {
  const pts: V[] = Array.from({ length: 12 }, (_, i) => [
    x + Math.cos((i * Math.PI) / 6) * r,
    y + Math.sin((i * Math.PI) / 6) * r,
    z,
  ]);
  return face(pts, color);
}
export function urbanActors(id: UrbanId, time: number) {
  const mesh: Face[] = [],
    phase = phaseAt(time),
    cfg = districts[id],
    { people, cars } = trafficAt(id, time);
  for (const s of [-1, 1]) {
    const z = J + s * 9,
      x = -s * 2.8;
    // The approach signal faces the driver across the junction; its counterpart faces opposing traffic.
    const front = z - s * 0.19;
    mesh.push(...box(x, 5.03, z, 2.35, 0.83, 0.32, "#293d44"));
    for (const [i, state] of (["green", "amber", "red"] as const).entries())
      mesh.push(
        disc(
          x + s * (i - 1) * 0.72,
          5.45,
          front,
          0.285,
          state === phase.vehicle
            ? { red: "#ff5443", green: "#41f0b1", amber: "#ffd254" }[state]
            : "#405257",
        ),
      );
    const px = cfg.turn * 12.9,
      pz = J + s * 6.7;
    mesh.push(...box(px, 2.1, pz, 0.52, 0.92, 0.22, "#304047"));
    const walkLit =
      phase.walk === "green" ||
      (phase.walk === "flash" && Math.floor(time * 3) % 2 === 0);
    for (const [green, y] of [
      [false, 2.77],
      [true, 2.33],
    ] as const) {
      const c = green
        ? walkLit
          ? "#49f5b5"
          : "#405257"
        : phase.walk === "red"
          ? "#ff6653"
          : "#405257";
      const f = pz - s * 0.13;
      mesh.push(
        disc(px, y + 0.11, f, 0.063, c),
        ...box(px, y - 0.035, f, 0.1, 0.15, 0.022, c),
        ...box(px - 0.056, y - 0.12, f, 0.052, 0.1, 0.022, c),
        ...box(px + 0.056, y - 0.12, f, 0.052, 0.1, 0.022, c),
      );
    }
  }
  for (const car of cars) {
    mesh.push(
      ...box(car.x, 0.29, car.z, 1.76, 0.74, 3.9, car.color),
      ...box(car.x, 0.99, car.z + 0.16, 1.48, 0.64, 2.1, "#779397"),
      ...box(car.x, 1.61, car.z + 0.16, 1.52, 0.085, 2.13, car.color),
    );
    for (const side of [-1, 1])
      mesh.push(
        ...box(
          car.x + side * 0.64,
          0.63,
          car.z - 1.98,
          0.34,
          0.18,
          0.05,
          "#ffecad",
        ),
      );
  }
  for (const p of people) {
    const step = p.walking ? Math.sin(time * 7) * 0.17 : 0;
    mesh.push(
      ...box(p.x, 0.79, p.z, 0.44, 0.69, 0.3, p.color),
      ...box(p.x, 1.48, p.z, 0.28, 0.3, 0.27, "#d9ad8e"),
      ...box(p.x - 0.11, 0, p.z + step, 0.16, 0.82, 0.19, "#424f5a"),
      ...box(p.x + 0.11, 0, p.z - step, 0.16, 0.82, 0.19, "#424f5a"),
    );
  }
  return mesh;
}
