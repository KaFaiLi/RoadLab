import type { FieldDrive } from "../../content/fieldDrives";
import type { Car } from "./simulation";
import { checkpoint, fieldSignal, fieldState, fieldX } from "./field";
import { box, face, type Face } from "./world";

export function fieldWorld(d: FieldDrive) {
  const mesh: Face[] = [];
  const strip = (
    z: number,
    end: number,
    left: number,
    right: number,
    color: string,
    layer: number,
  ) => {
    const a = fieldX(d, z),
      b = fieldX(d, end);
    mesh.push(
      face(
        [
          [a + left, 0.01, z],
          [a + right, 0.01, z],
          [b + right, 0.01, end],
          [b + left, 0.01, end],
        ],
        color,
        layer,
      ),
    );
  };
  const snowy = d.weather === "snow" || d.weather === "ice";
  const coat = {
    school: "#dcb78b",
    transit: "#809da5",
    shops: "#cd9375",
    works: "#b2a895",
    rail: "#987b65",
    country: "#85a267",
    coast: "#77a5aa",
    winter: "#b9bec1",
  }[d.group];
  for (let z = -12; z < 224; z += 6) {
    strip(
      z,
      z + 6,
      -34,
      34,
      snowy ? "#e7edf0" : d.group === "country" ? "#829c69" : "#c1b7a6",
      0,
    );
    if (d.group === "coast") strip(z, z + 6, 9, 34, "#659dab", 0.1);
    strip(
      z,
      z + 6,
      -5.3,
      5.3,
      snowy ? "#939fa4" : d.weather === "rain" ? "#53606a" : "#647075",
      0.2,
    );
    for (const x of [-5, 5]) strip(z, z + 6, x, x + 0.1, "#efece0", 0.4);
    strip(z, z + 3, -0.06, 0.06, "#f3ecce", 0.4);
    if (z % 18 === 0) {
      for (const side of [-1, 1]) {
        const x = fieldX(d, z) + side * 11;
        if (d.group === "country" || (side === 1 && d.group === "winter")) {
          mesh.push(
            ...box(x, 0, z, 0.55, 2, 0.55, "#785e47"),
            ...box(x, 2, z, 3, 3, 3, snowy ? "#b9cfc5" : "#51785e"),
          );
        } else if (d.group === "coast" && side === 1) {
          mesh.push(
            ...box(x - 4, 0, z, 0.22, 1, 0.22, "#777f80"),
            ...box(x - 4, 0.8, z, 0.12, 0.18, 18, "#adae9e"),
          );
        } else {
          const height =
            d.group === "transit" ? 7 : d.group === "shops" ? 3 : 4;
          mesh.push(
            ...box(x, 0, z, 6, height, 8, coat),
            ...box(x - side * 3.02, 1.5, z, 0.1, 1.1, 5.4, "#75909a"),
          );
          if (d.group === "shops")
            mesh.push(...box(x - side * 3.5, 2.7, z, 1.1, 0.3, 7, "#ac5647"));
        }
      }
    }
  }
  d.stages.forEach((task, i) => {
    const z = checkpoint(i, d),
      x = fieldX(d, z);
    if (["side", "stop"].includes(task))
      mesh.push(
        face(
          [
            [x - 24, 0, z + 1],
            [x + 24, 0, z + 1],
            [x + 24, 0, z + 8],
            [x - 24, 0, z + 8],
          ],
          "#647075",
          0.3,
        ),
      );
    if (["zebra", "pair", "hidden", "queue"].includes(task))
      for (let a = -4.8; a < 5; a += 1)
        strip(z + 1, z + 3.7, a, a + 0.55, "#fff7e6", 0.6);
    if (["tracks", "train"].includes(task))
      for (const dz of [2.4, 3.8])
        mesh.push(
          face(
            [
              [-30, 0, z + dz],
              [30, 0, z + dz],
              [30, 0, z + dz + 0.18],
              [-30, 0, z + dz + 0.18],
            ],
            "#443f39",
            0.6,
          ),
        );
    if (!["limit20", "limit30", "edge", "centre", "deer"].includes(task))
      strip(z - 0.28, z, -5.1, -0.15, "#fff7eb", 0.7);
    if (
      [
        "stop",
        "side",
        "limit20",
        "limit30",
        "deer",
        "train",
        "tracks",
      ].includes(task)
    ) {
      const p = x - 5.45;
      mesh.push(...box(p, 0, z, 0.11, 2.7, 0.11, "#859391"));
      if (task === "stop" || task === "side")
        mesh.push(
          face(
            [
              [p - 0.62, 3.12, z],
              [p + 0.62, 3.12, z],
              [p, 2.12, z],
            ],
            "#ba403c",
          ),
        );
      else if (task.startsWith("limit")) {
        const disk = (r: number, depth: number, color: string) =>
          face(
            Array.from({ length: 20 }, (_, j) => [
              p + r * Math.cos((j * Math.PI) / 10),
              2.7 + r * Math.sin((j * Math.PI) / 10),
              depth,
            ]),
            color,
          );
        mesh.push(disk(0.62, z, "#b8383c"), disk(0.5, z - 0.02, "#fcf6de"));
      } else
        mesh.push(
          face(
            [
              [p, 3.4, z],
              [p + 0.65, 2.75, z],
              [p, 2.1, z],
              [p - 0.65, 2.75, z],
            ],
            "#dfac37",
          ),
        );
    }
    if (task.startsWith("limit"))
      for (const offset of [0, 14])
        strip(z + offset, z + offset + 0.45, -5, -4, "#e7c572", 0.6);
    if (task === "hidden")
      mesh.push(...box(x - 5.95, 0, z - 2, 1.9, 2.55, 4.2, "#cbd2c8"));
    if (task === "edge" || task === "centre")
      for (let dz = 0; dz < 12; dz += 2.8) {
        const p = fieldX(d, z + dz) + (task === "edge" ? -3.85 : -1.65);
        mesh.push(
          ...box(p, 0, z + dz, 0.42, 0.1, 0.42, "#534a40"),
          face(
            [
              [p - 0.2, 0.1, z + dz],
              [p + 0.2, 0.1, z + dz],
              [p, 0.82, z + dz],
            ],
            "#ef7534",
          ),
        );
      }
  });
  return mesh;
}

export function fieldActors(d: FieldDrive, car: Car) {
  const mesh: Face[] = [];
  d.stages.forEach((task, i) => {
    const z = checkpoint(i, d),
      x = fieldX(d, z);
    const age =
      i < car.step
        ? 45
        : i === car.step && car.encounterAt !== null
          ? car.elapsed - car.encounterAt
          : 0;
    const s = fieldState(task, age);
    s.people.forEach((p, j) => {
      const px = x + p,
        pz = z + 2 + j * 0.8;
      mesh.push(
        ...box(px, 0.7, pz, 0.48, 0.73, 0.32, j ? "#a76275" : "#36838a"),
        ...box(px, 1.43, pz, 0.31, 0.34, 0.28, "#dcb595"),
      );
      for (const offset of [-0.13, 0.13])
        mesh.push(...box(px + offset, 0, pz, 0.17, 0.7, 0.2, "#374c57"));
    });
    if ((task === "bus" || task === "queue") && s.lead < 55) {
      for (const dz of task === "queue" ? [0, 5.5] : [0]) {
        const pz = z + s.lead + dz,
          px = fieldX(d, pz) - 2.65,
          bus = task === "bus";
        mesh.push(
          ...box(
            px,
            0.2,
            pz,
            2,
            bus ? 2.6 : 1.25,
            4,
            bus ? "#d59b52" : "#7992a0",
          ),
          ...box(
            px,
            bus ? 1.6 : 0.95,
            pz - 2.03,
            1.7,
            bus ? 0.86 : 0.39,
            0.06,
            "#435864",
          ),
        );
        for (const side of [-0.8, 0.8])
          mesh.push(
            ...box(px + side, 0.5, pz - 2.06, 0.25, 0.15, 0.05, "#ca5046"),
          );
      }
    }
    if (task === "side" && s.crossX < 24)
      mesh.push(
        ...box(x + s.crossX, 0.2, z + 4, 3.9, 1, 1.8, "#b66b59"),
        ...box(x + s.crossX, 1.2, z + 4, 2, 0.5, 1.6, "#657f87"),
      );
    if (task === "train" || task === "tracks") {
      const gate = task === "train" ? s.barrier : 0;
      mesh.push(
        ...box(x - 5.1, 0, z, 0.3, 1, 0.3, "#d3aa44"),
        face(
          [
            [x - 5.1, 0.85, z],
            [x - 5.1 + 5 * gate, 0.85 + 5 * (1 - gate), z],
            [x - 5.1 + 5 * gate, 1.02 + 5 * (1 - gate), z],
            [x - 5.1, 1.02, z],
          ],
          "#ecb532",
        ),
      );
      if (task === "train" && age < 10) {
        const px = x - 40 + age * 8;
        mesh.push(
          ...box(px, 0.2, z + 3, 18, 3, 2.4, "#b6c5bc"),
          ...box(px, 1.5, z + 1.78, 16, 0.85, 0.08, "#4c6e7b"),
        );
      }
    }
    if (task === "red" || task === "portable") {
      const p = x - 5.25;
      mesh.push(
        ...box(p, 0, z, 0.13, 3, 0.13, "#677671"),
        ...box(p, 2.7, z, 1.6, 0.65, 0.33, "#344343"),
      );
      const color = fieldSignal(d, i, car.elapsed, age);
      for (const side of [-0.5, 0, 0.5])
        mesh.push(
          ...box(
            p + side,
            2.85,
            z - 0.2,
            0.32,
            0.32,
            0.06,
            side === 0.5
              ? color === "red"
                ? "#ff604e"
                : "#703f3a"
              : side === 0
                ? color === "amber"
                  ? "#ffbd4b"
                  : "#645544"
                : color === "green"
                  ? "#64e6a5"
                  : "#395951",
          ),
        );
    }
    if (task === "deer") {
      const p = x + s.deerX;
      mesh.push(
        ...box(p, 0.68, z + 2, 1.2, 0.57, 0.46, "#986b49"),
        ...box(p - 0.52, 1.1, z + 2, 0.38, 0.6, 0.32, "#a67950"),
      );
      for (const dx of [-0.42, 0.42])
        mesh.push(...box(p + dx, 0, z + 2, 0.13, 0.75, 0.31, "#77533f"));
      for (const dz of [-0.11, 0.11])
        mesh.push(
          ...box(p - 0.54, 1.67, z + 2 + dz, 0.09, 0.24, 0.08, "#604c3a"),
        );
    }
  });
  return mesh;
}
