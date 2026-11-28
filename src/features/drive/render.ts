import { course, roadX, type Car } from "./simulation";
import { townPedestrian, type Face, type V } from "./world";
import { urbanActors } from "./urbanWorld";
import { junction, type RouteId } from "./urban";
import type { FieldDrive } from "../../content/fieldDrives";
import { fieldActors } from "./fieldWorld";
import { fieldX, checkpoint } from "./field";
type Point = [number, number];
function polygon(ctx: CanvasRenderingContext2D, p: Point[], color: string) {
  ctx.beginPath();
  p.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
export function render(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  car: Car,
  world: Face[],
  route: RouteId = "town",
  look = 0,
  mirror = false,
  field?: FieldDrive,
  weather = field?.weather,
) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(
    0,
    weather === "dusk"
      ? "#696782"
      : weather && ["fog", "snow", "rain", "ice"].includes(weather)
        ? "#95a8b2"
        : "#78b4c7",
  );
  sky.addColorStop(
    1,
    weather === "dusk"
      ? "#dfae8b"
      : weather && weather !== "clear"
        ? "#dce5e6"
        : "#fae9c7",
  );
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const horizon = h * 0.43,
    focal = Math.min(w * 0.88, h * 1.32);
  const sin = Math.sin(car.yaw + look),
    cos = Math.cos(car.yaw + look);
  const cameraX = car.x + 0.36 * Math.cos(car.yaw),
    cameraZ = car.z - 0.36 * Math.sin(car.yaw);
  for (let row = 0; row < 2; row++) {
    const pts: Point[] = [[0, horizon + 2]];
    for (let i = 0; i <= 80; i++) {
      const x = (i * w) / 80,
        t = x / focal + car.yaw + look + row * 0.76;
      pts.push([
        x,
        horizon -
          h *
            (0.018 +
              0.045 * (1 + Math.cos(t * 5.2)) +
              0.024 * Math.abs(Math.sin(t * 10 + row))) *
            (row ? 0.66 : 1),
      ]);
    }
    pts.push([w, horizon + 2]);
    polygon(ctx, pts, row ? "#8fa696" : "#b3c4af");
  }
  ctx.fillStyle = "#8eaa76";
  ctx.fillRect(0, horizon, w, h - horizon);
  const camera = ([x, y, z]: V): V => [
    (x - cameraX) * cos - (z - cameraZ) * sin,
    y - 1.38,
    (x - cameraX) * sin + (z - cameraZ) * cos,
  ];
  const project = ([x, y, z]: V): Point => [
    w / 2 + (x * focal) / z,
    horizon - (y * focal) / z,
  ];
  function label(x: number, y: number, z: number, text: string, size: number) {
    const p = camera([x, y, z]);
    if (p[2] < 0.7 || p[2] > 120) return;
    const [sx, sy] = project(p);
    ctx.font = "bold " + Math.max(1, (size * focal) / p[2]) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff9e8";
    ctx.fillText(text, sx, sy);
  }
  const actors = field
    ? fieldActors(field, car)
    : route === "town"
      ? townPedestrian(car)
      : urbanActors(route, car);
  const faces: { p: Point[]; depth: number; color: string; layer: number }[] =
    [];
  for (const item of [...world, ...actors]) {
    if (
      item.v.every((v) => v[2] > car.z + 125) ||
      item.v.every((v) => v[2] < car.z - 125)
    )
      continue;
    const vertices = item.v.map(camera);
    const slope = w / (2 * focal);
    if (
      vertices.every(([, , z]) => z < 0.35) ||
      vertices.every(([, , z]) => z > 125) ||
      vertices.every(([x, , z]) => x > z * slope) ||
      vertices.every(([x, , z]) => x < -z * slope)
    )
      continue;
    const clipped: V[] = [];
    for (let i = 0; i < vertices.length; i++) {
      const a = vertices[i],
        b = vertices[(i + 1) % vertices.length];
      if (a[2] >= 0.35) clipped.push(a);
      if (a[2] >= 0.35 !== b[2] >= 0.35) {
        const t = (0.35 - a[2]) / (b[2] - a[2]);
        clipped.push([
          a[0] + t * (b[0] - a[0]),
          a[1] + t * (b[1] - a[1]),
          0.35,
        ]);
      }
    }
    if (clipped.length < 3) continue;
    const p = clipped.map(project);
    if (
      p.every((v) => v[0] < 0) ||
      p.every((v) => v[0] > w) ||
      p.every((v) => v[1] > h)
    )
      continue;
    faces.push({
      p,
      color: item.color,
      depth: vertices.reduce((s, v) => s + v[2], 0) / vertices.length,
      layer: item.layer,
    });
  }
  faces.sort((a, b) => a.layer - b.layer || b.depth - a.depth);
  for (const f of faces) {
    polygon(ctx, f.p, f.color);
    if (
      (!weather && route === "snow") ||
      weather === "fog" ||
      weather === "snow"
    ) {
      ctx.globalAlpha = Math.min(0.94, Math.max(0, (f.depth - 7) / 44));
      polygon(ctx, f.p, "#e0e8eb");
      ctx.globalAlpha = 1;
    }
  }
  if (mirror) return;
  if (route === "lanes" && car.z < 17) label(-3, 4.64, 16.85, "↑　　　 →", 0.5);
  if (field) {
    field.stages.forEach((task, i) => {
      const z = checkpoint(i, field),
        x = fieldX(field, z) - 5.45;
      if (task.startsWith("limit")) {
        const p = camera([x, 2.54, z - 0.03]);
        if (p[2] > 0.7 && p[2] < 95) {
          const [sx, sy] = project(p);
          ctx.font = "bold " + (0.46 * focal) / p[2] + "px sans-serif";
          ctx.textAlign = "center";
          ctx.fillStyle = "#323a43";
          ctx.fillText(task.slice(5), sx, sy);
        }
      } else if (task === "stop" || task === "side")
        label(x, 2.84, z - 0.02, "止まれ", 0.22);
      else if (task === "train" || task === "tracks" || task === "deer")
        label(x, 2.57, z - 0.02, task === "deer" ? "鹿" : "×", 0.46);
    });
  } else if (route === "town") {
    label(roadX(course.stop) - 4.95, 2.82, course.stop - 0.06, "止まれ", 0.24);
  }
  if (route !== "town") {
    if (car.z < 20)
      label(
        -6.85,
        3.2,
        19.9,
        route === "cycle"
          ? "← 川沿い"
          : route === "snow"
            ? "市街地 →"
            : ["market", "delivery"].includes(route)
              ? "← 商店街"
              : ["station", "queue", "lanes"].includes(route)
                ? "駅前 →"
                : "市役所 →",
        0.49,
      );
    if (route === "avenue" && car.x < junction.secondaryLine && car.x > 2)
      label(
        junction.secondaryLine - 0.08,
        2.88,
        junction.z + 6.65,
        "止まれ",
        0.34,
      );
  }
  // The inside of the car remains fixed to the camera, independently of the street meshes.
  polygon(
    ctx,
    [
      [0, 0],
      [w * 0.025, 0],
      [w * 0.086, h * 0.76],
      [0, h * 0.86],
    ],
    "#35494b",
  );
  polygon(
    ctx,
    [
      [w, 0],
      [w * 0.982, 0],
      [w * 0.935, h * 0.77],
      [w, h * 0.86],
    ],
    "#35494b",
  );
  polygon(
    ctx,
    [
      [0, h * 0.8],
      [w * 0.14, h * 0.745],
      [w * 0.87, h * 0.745],
      [w, h * 0.8],
      [w, h],
      [0, h],
    ],
    "#344348",
  );
  polygon(
    ctx,
    [
      [0, h * 0.8],
      [w * 0.14, h * 0.745],
      [w * 0.87, h * 0.745],
      [w, h * 0.8],
      [w, h * 0.835],
      [0, h * 0.835],
    ],
    "#5a6b69",
  );
  ctx.fillStyle = "#1e2d30";
  ctx.fillRect(0, h * 0.835, w, h * 0.017);
  // Passenger-side vents and a brushed trim line give the cockpit a fixed visual reference.
  const ventX = w * 0.13,
    ventY = h * 0.865,
    ventW = w * 0.18,
    ventH = h * 0.055;
  ctx.fillStyle = "#17282c";
  ctx.fillRect(ventX, ventY, ventW, ventH);
  ctx.fillStyle = "#667774";
  for (let i = 1; i < 4; i++)
    ctx.fillRect(ventX + 3, ventY + (i * ventH) / 4, ventW - 6, 1.5);
  ctx.fillStyle = "#9faba1";
  ctx.fillRect(w * 0.05, h * 0.943, w * 0.34, 1.6);
  const radius = Math.min(h * 0.205, w * 0.23),
    cx = w * 0.66,
    cy = h * 0.962;
  ctx.fillStyle = "#203236";
  ctx.beginPath();
  ctx.ellipse(
    cx,
    cy - radius * 0.45,
    radius * 0.73,
    radius * 0.44,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#dcf1ce";
  ctx.font = "600 " + Math.max(14, radius * 0.33) + "px monospace";
  ctx.textAlign = "center";
  ctx.fillText(String(Math.round(car.speed * 3.6)), cx, cy - radius * 0.42);
  ctx.font = Math.max(8, radius * 0.1) + "px sans-serif";
  ctx.fillText("km/h", cx, cy - radius * 0.24);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(car.steer * 0.95);
  ctx.strokeStyle = "#17272c";
  ctx.lineWidth = radius * 0.16;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  for (const a of [0.15, Math.PI - 0.15, Math.PI / 2]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
    ctx.stroke();
  }
  ctx.fillStyle = "#435455";
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 0.32, radius * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (route === "cycle") {
    // Reflected camera points behind the left side of the car; it renders the same actors and clock.
    const mw = w * 0.24,
      mh = h * 0.2,
      mx = w * 0.035,
      my = h * 0.5;
    ctx.save();
    ctx.fillStyle = "#233739";
    ctx.fillRect(mx - 3, my - 3, mw + 6, mh + 6);
    ctx.beginPath();
    ctx.rect(mx, my, mw, mh);
    ctx.clip();
    ctx.translate(mx + mw, my);
    ctx.scale(-1, 1);
    render(
      ctx,
      mw,
      mh,
      {
        ...car,
        x: car.x - 1.1 * Math.cos(car.yaw),
        z: car.z + 1.1 * Math.sin(car.yaw),
      },
      world,
      route,
      Math.PI + 0.16,
      true,
      undefined,
      weather,
    );
    ctx.restore();
  }
}
