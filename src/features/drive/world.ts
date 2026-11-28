import { course, pedestrianX, type Car, roadX } from "./simulation";
export type V = [number, number, number];
export type Face = { v: V[]; color: string; layer: number };
export function face(v: V[], color: string, layer = 2): Face {
  return { v, color, layer };
}
function shade(hex: string, amount: number) {
  return (
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(parseInt(hex.slice(i, i + 2), 16) * amount)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
export function box(
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  color: string,
): Face[] {
  const a = x - w / 2,
    b = x + w / 2,
    n = z - d / 2,
    f = z + d / 2,
    t = y + h;
  return [
    face(
      [
        [a, y, n],
        [b, y, n],
        [b, t, n],
        [a, t, n],
      ],
      color,
    ),
    face(
      [
        [a, y, f],
        [a, t, f],
        [b, t, f],
        [b, y, f],
      ],
      shade(color, 0.85),
    ),
    face(
      [
        [a, y, n],
        [a, t, n],
        [a, t, f],
        [a, y, f],
      ],
      shade(color, 0.76),
    ),
    face(
      [
        [b, y, n],
        [b, y, f],
        [b, t, f],
        [b, t, n],
      ],
      shade(color, 0.91),
    ),
    face(
      [
        [a, t, n],
        [b, t, n],
        [b, t, f],
        [a, t, f],
      ],
      color,
    ),
  ];
}
export function makeWorld() {
  const world: Face[] = [];
  function add(...f: Face[]) {
    world.push(...f);
  }
  function strip(
    z: number,
    end: number,
    left: number,
    right: number,
    y: number,
    color: string,
    layer = 0,
  ) {
    add(
      face(
        [
          [roadX(z) + left, y, z],
          [roadX(z) + right, y, z],
          [roadX(end) + right, y, end],
          [roadX(end) + left, y, end],
        ],
        color,
        layer,
      ),
    );
  }
  for (let z = -15; z < 220; z += 3) {
    strip(z, z + 3, -8, 8, 0.01, "#a6aaa1");
    strip(z, z + 3, -4.4, 4.4, 0.03, "#515b5b", 0.1);
    for (const sign of [-1, 1]) {
      const edge = sign * 4.19;
      strip(z, z + 3, edge - 0.055, edge + 0.055, 0.04, "#eee8d0", 0.3);
    }
    if (z % 9 === 0 && Math.abs(z - course.stop) > 5)
      strip(z, z + 3, -0.055, 0.055, 0.04, "#e8e5cf", 0.3);
  }
  strip(course.stop - 0.42, course.stop, -4.13, -0.05, 0.05, "#fff4dc", 0.4);
  strip(
    course.crossing - 2.45,
    course.crossing - 2,
    -4.13,
    -0.05,
    0.05,
    "#fff4dc",
    0.4,
  );
  for (let i = -4; i < 4; i++)
    strip(
      course.crossing - 0.6,
      course.crossing + 1.4,
      i,
      i + 0.48,
      0.05,
      "#fff6e5",
      0.4,
    );

  for (const side of [-1, 1]) {
    const x = roadX(course.stop + 4),
      z = course.stop + 4;
    add(
      face(
        [
          [x + side * 4.4, 0.045, z - 2.5],
          [x + side * 33, 0.045, z - 2.5],
          [x + side * 33, 0.045, z + 2.5],
          [x + side * 4.4, 0.045, z + 2.5],
        ],
        "#576160",
        0.32,
      ),
    );
  }
  const palette = [
    "#ead1a8",
    "#b5c8b9",
    "#e4b497",
    "#d7cba9",
    "#a4beb8",
    "#e7d5bd",
  ];
  for (let i = 0; i < 16; i++) {
    for (const side of [-1, 1]) {
      const z = -7 + i * 13 + (side === 1 ? 5 : 0);
      if (Math.abs(z - course.stop) < 9 || Math.abs(z - course.crossing) < 6)
        continue;
      const x = roadX(z) + side * (10 + (i % 3)),
        w = 5.1,
        h = 3.5 + (i % 3) * 1.1,
        d = 6.2;
      add(
        ...box(
          x,
          0,
          z,
          w,
          h,
          d,
          palette[(i + (side === 1 ? 2 : 0)) % palette.length],
        ),
      );
      const roof = i % 3 === 0 ? "#9b6656" : "#506461";
      const e = w / 2 + 0.35,
        f = d / 2 + 0.3;
      add(
        face(
          [
            [x - e, h, z - f],
            [x + e, h, z - f],
            [x, h + 1.25, z - f],
          ],
          roof,
        ),
        face(
          [
            [x - e, h, z - f],
            [x, h + 1.25, z - f],
            [x, h + 1.25, z + f],
            [x - e, h, z + f],
          ],
          shade(roof, 0.88),
        ),
        face(
          [
            [x, h + 1.25, z - f],
            [x + e, h, z - f],
            [x + e, h, z + f],
            [x, h + 1.25, z + f],
          ],
          roof,
        ),
      );
      for (const dx of [-1.35, 1.35]) {
        add(
          ...box(x + dx, 1.55, z - d / 2 - 0.035, 1.15, 1.05, 0.07, "#526d70"),
        );
      }
      const facade = x - side * (w / 2 + 0.04);
      for (const dz of [-1.7, 1.7])
        add(...box(facade, 1.35, z + dz, 0.08, 1.35, 1.25, "#597574"));
      if (i % 3 === 0) {
        add(
          ...box(
            facade - side * 0.35,
            2.65,
            z,
            0.85,
            0.21,
            d * 0.92,
            "#bb6149",
          ),
          ...box(facade, 0.05, z, 0.09, 2, 1.02, "#5b5145"),
        );
      }
    }
  }
  for (let i = 0; i < 23; i++) {
    const z = i * 8 - 2,
      side = i % 2 === 0 ? -1 : 1,
      x = roadX(z) + side * (6.4 + (i % 3) * 0.35);
    if (Math.abs(z - course.stop) < 7 || Math.abs(z - course.crossing) < 6)
      continue;
    add(...box(x, 0, z, 0.32, 2.15, 0.34, "#73644f"));
    const base: V[] = [
      [x - 1.6, 1.9, z],
      [x, 1.9, z - 1.4],
      [x + 1.6, 1.9, z],
      [x, 1.9, z + 1.4],
    ];
    for (let j = 0; j < 4; j++)
      add(
        face(
          [base[j], base[(j + 1) % 4], [x, 4.8 + (i % 3) * 0.3, z]],
          ["#77945b", "#628452", "#517249", "#75905a"][j],
        ),
      );
  }
  for (let z = 9; z < 180; z += 19) {
    const x = roadX(z) + 5.9;
    add(
      ...box(x, 0, z, 0.18, 6.3, 0.18, "#847d6b"),
      ...box(x, 5.7, z, 1.5, 0.13, 0.15, "#605e53"),
    );
    for (const dx of [-0.5, 0.5]) {
      const nx = roadX(z + 19) + 5.9;
      add(
        face(
          [
            [x + dx, 5.8, z],
            [nx + dx, 5.8, z + 19],
            [nx + dx, 5.83, z + 19],
            [x + dx, 5.83, z],
          ],
          "#4f615b",
        ),
      );
    }
  }
  // A roadside vending machine and a compact parked van give scale to the village.
  const machineX = roadX(15) - 6.15;
  add(
    ...box(machineX, 0.02, 15, 0.86, 1.8, 0.68, "#b94f45"),
    ...box(machineX, 0.83, 14.65, 0.72, 0.84, 0.04, "#dfede3"),
  );
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 4; col++)
      add(
        ...box(
          machineX - 0.24 + col * 0.16,
          0.94 + row * 0.32,
          14.62,
          0.09,
          0.19,
          0.04,
          ["#db9d59", "#72947d", "#899daa", "#c57064"][col],
        ),
      );
  add(...box(machineX, 0.32, 14.64, 0.52, 0.14, 0.04, "#414c48"));
  const vanX = roadX(30) + 6.1;
  add(
    ...box(vanX, 0.31, 30, 1.72, 1.15, 3.6, "#c9d5ce"),
    ...box(vanX, 1.44, 30.25, 1.68, 0.69, 3.1, "#e0e6d8"),
    ...box(vanX, 1.48, 28.67, 1.47, 0.54, 0.04, "#617b81"),
  );
  for (const x of [-0.6, 0.6])
    add(...box(vanX + x, 0.74, 28.17, 0.34, 0.2, 0.04, "#f5e0ad"));
  const signX = roadX(course.stop) - 4.95;
  add(...box(signX, 0, course.stop, 0.095, 2.55, 0.1, "#959c95"));
  // Point-down triangular Japanese stop sign with an inset white border.
  for (const [s, c, d] of [
    [0.63, "#b83f36", 0],
    [0.57, "#fff6e8", -0.02],
    [0.525, "#d14a3d", -0.04],
  ] as const) {
    add(
      face(
        [
          [signX - s, 2.8 + s * 0.48, course.stop + d],
          [signX + s, 2.8 + s * 0.48, course.stop + d],
          [signX, 2.8 - s * 1.15, course.stop + d],
        ],
        c,
      ),
    );
  }
  return world;
}

export function townPedestrian(car: Car) {
  const px = pedestrianX(car),
    pz = course.crossing + 0.4,
    walk =
      car.pedTime > 0 && car.pedTime < 5 ? Math.sin(car.pedTime * 8) * 0.16 : 0;
  return [
    ...box(px, 0.83, pz, 0.44, 0.58, 0.29, "#c36f43"),
    ...box(px, 1.41, pz, 0.27, 0.29, 0.25, "#d8aa82"),
    ...box(px, 1.65, pz, 0.3, 0.095, 0.27, "#514c42"),
    ...box(px - 0.12 - walk, 0, pz, 0.15, 0.84, 0.19, "#455764"),
    ...box(px + 0.12 + walk, 0, pz, 0.15, 0.84, 0.19, "#455764"),
  ];
}
