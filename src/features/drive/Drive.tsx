import { useEffect, useRef, useState } from "react";
import type { Locale } from "../../content/schema";
import { rules } from "../../content";
import { sources } from "../../content/sources";
import { ui } from "../../content/ui";
import { Icon } from "../../components/Icon";
import { course, drive, neutral, spawn, type Controls } from "./simulation";
import { render } from "./render";
import { makeWorld } from "./world";
import { copy } from "./strings";
import {
  districts,
  urbanSpawn,
  urbanDrive,
  urbanProgress,
  phaseAt,
  junction,
  type RouteId,
} from "./urban";
import { urbanWorld } from "./urbanWorld";
import { urbanCopy } from "./urbanCopy";
import "./drive.css";
const strings = { ...copy, ...urbanCopy };
type Input = keyof Controls | "lookLeft" | "lookRight";
type Phase = "ready" | "active" | "paused" | "ended";
const keyMap: Record<string, Input> = {
  KeyQ: "lookLeft",
  KeyE: "lookRight",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "gas",
  KeyW: "gas",
  ArrowDown: "brake",
  KeyS: "brake",
};
export default function Drive({ l }: { l: Locale }) {
  const [route, setRoute] = useState<RouteId>("town");
  return <Course key={route} route={route} setRoute={setRoute} l={l} />;
}
function Course({
  l,
  route,
  setRoute,
}: {
  l: Locale;
  route: RouteId;
  setRoute: (id: RouteId) => void;
}) {
  const urban = route !== "town",
    district = urban ? districts[route] : null;
  const newCar = urban ? urbanSpawn : spawn;
  const canvas = useRef<HTMLCanvasElement>(null),
    car = useRef(newCar()),
    held = useRef(new Map<string, Input>());
  const [phase, setPhase] = useState<Phase>("ready"),
    [snapshot, setSnapshot] = useState(() => ({ ...car.current })),
    [available, setAvailable] = useState(true);
  const text = (k: keyof typeof strings) => strings[k][l];
  useEffect(() => {
    const el = canvas.current,
      ctx = el?.getContext("2d", { alpha: false });
    if (!el || !ctx) {
      setAvailable(false);
      return;
    }
    const world = route === "town" ? makeWorld() : urbanWorld(route);
    let look = 0;
    let frame = 0,
      last = 0,
      reported = 0;
    const clear = () => held.current.clear();
    const pause = () => {
      clear();
      setPhase((p) => (p === "active" ? "paused" : p));
    };
    const visibility = () => {
      if (document.hidden) pause();
    };
    function key(e: KeyboardEvent) {
      if (phase !== "active" || e.altKey || e.ctrlKey || e.metaKey) return;
      if (
        e.target instanceof HTMLElement &&
        ["SELECT", "INPUT", "TEXTAREA"].includes(e.target.tagName)
      )
        return;
      if (e.code === "Escape" && e.type === "keydown") {
        pause();
        return;
      }
      const input = keyMap[e.code];
      if (!input) return;
      e.preventDefault();
      if (e.type === "keydown") held.current.set(e.code, input);
      else held.current.delete(e.code);
    }
    function paint(time: number) {
      if (!el || !ctx) return;
      const w = el.clientWidth,
        h = el.clientHeight;
      if (!w || !h) return;
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      if (
        el.width !== Math.round(w * scale) ||
        el.height !== Math.round(h * scale)
      ) {
        el.width = Math.round(w * scale);
        el.height = Math.round(h * scale);
      }
      ctx.setTransform(el.width / w, 0, 0, el.height / h, 0, 0);
      if (phase === "active") {
        const keys = neutral();
        const inputs = new Set(held.current.values());
        for (const k of Object.keys(keys) as (keyof Controls)[])
          keys[k] = inputs.has(k);
        const dt = last ? (time - last) / 1000 : 0;
        look +=
          (Number(inputs.has("lookRight")) -
            Number(inputs.has("lookLeft")) -
            look) *
          Math.min(1, dt * 10);
        if (route === "town") drive(car.current, keys, dt);
        else urbanDrive(car.current, keys, dt, route);
        if (time - reported > 90 || car.current.result) {
          setSnapshot({ ...car.current });
          reported = time;
        }
      }
      render(ctx, w, h, car.current, world, route, urban ? look : 0);
      last = time;
      if (phase === "active") {
        if (car.current.result) setPhase("ended");
        else frame = requestAnimationFrame(paint);
      }
    }
    const resize = new ResizeObserver(() => {
      if (phase !== "active") paint(performance.now());
    });
    resize.observe(el);
    frame = requestAnimationFrame(paint);
    window.addEventListener("keydown", key);
    window.addEventListener("keyup", key);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clear();
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("keydown", key);
      window.removeEventListener("keyup", key);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [phase, route, urban]);
  const stage = !snapshot.stopped
    ? "first"
    : !snapshot.crossed
      ? "second"
      : snapshot.pedTime < 5
        ? "wait"
        : "third";
  const distance = Math.max(
    0,
    Math.round(
      (stage === "first"
        ? course.stop
        : stage === "third"
          ? course.finish
          : course.crossing - 2) -
        snapshot.z -
        2,
    ),
  );
  const name = district ? district.name[l] : text("route");
  const routeLength = urban ? junction.z + junction.finish : course.finish;
  const progress =
    route === "town" ? snapshot.z + 2 : urbanProgress(snapshot, route);
  const hint =
    route === "avenue" && snapshot.x > junction.cross + 2 && !snapshot.stopped
      ? "sideStop"
      : district
        ? district.turn * snapshot.x > junction.cross + 2
          ? "exit"
          : district.turn === 1
            ? "turnRight"
            : "turnLeft"
        : stage;
  const signals = phaseAt(snapshot.elapsed);
  const lamp = (s: typeof signals.vehicle | typeof signals.walk) =>
    text(s === "red" ? "redLight" : s === "amber" ? "yellow" : s);
  const rule = rules.find(
    (r) =>
      r.id ===
      (snapshot.result === "yield"
        ? "cross"
        : snapshot.result === "lane"
          ? "left"
          : "stop"),
  );
  function start() {
    if (phase !== "paused") {
      car.current = newCar();
      setSnapshot({ ...car.current });
    }
    setPhase("active");
  }
  return (
    <section className="driving">
      <div className="drive-head">
        <div>
          <small className="kicker">
            <Icon name="road" />
            {name} · {routeLength} m
          </small>
          <h1>{text("title")}</h1>
        </div>
        {phase === "active" && (
          <button
            className="drive-secondary"
            onClick={() => setPhase("paused")}
          >
            {text("pause")} Ⅱ
          </button>
        )}
      </div>
      <label className="route-select">
        {text("choose")}
        <select
          disabled={phase === "active"}
          value={route}
          onChange={(e) => setRoute(e.target.value as RouteId)}
        >
          <option value="town">{text("route")}</option>
          {Object.entries(districts).map(([id, d]) => (
            <option key={id} value={id}>
              {d.name[l]}
            </option>
          ))}
        </select>
      </label>
      <div className="windshield">
        <canvas
          ref={canvas}
          role="img"
          aria-label={text(urban ? "urbanView" : "view")}
        />
        <div className="drive-hud">
          <div>
            <i />
            <span aria-live="polite">{text(hint)}</span>
          </div>
          {stage !== "wait" && (
            <strong>
              {urban
                ? Math.max(0, Math.round(routeLength - progress))
                : distance}{" "}
              m
            </strong>
          )}
        </div>
        {phase === "paused" && (
          <div className="drive-shade">
            <button className="button warm" onClick={start}>
              {text("resume")} ▸
            </button>
          </div>
        )}
      </div>
      {urban && (
        <div className="signal-strip">
          {(
            [
              ["lights", signals.vehicle],
              ["opposition", signals.vehicle],
              ["walkLight", signals.walk],
            ] as const
          ).map(([key, lampState]) => (
            <div key={key}>
              <i className={"lens " + lampState} />
              <span>
                {text(key)}
                <b>{lamp(lampState)}</b>
              </span>
            </div>
          ))}
        </div>
      )}
      <progress
        aria-label={name}
        value={Math.min(routeLength, Math.max(0, progress))}
        max={routeLength}
      />
      {!available ? (
        <p role="alert">{text("unavailable")}</p>
      ) : phase === "ready" || phase === "ended" ? (
        <div className="drive-brief">
          <div>
            {urban && (
              <p className="urban-sources">
                <a href="https://laws.e-gov.go.jp/law/335CO0000000270">
                  {text("signalSource")} ↗
                </a>{" "}
                · <a href={sources.npa.url}>{text("yieldSource")} ↗</a>
              </p>
            )}
            {phase === "ended" && (
              <h2>
                {text(snapshot.result === "complete" ? "complete" : "ended")}
              </h2>
            )}
            <p>
              {phase === "ready"
                ? district
                  ? district.brief[l]
                  : text("brief")
                : text(
                    snapshot.result === "complete"
                      ? urban
                        ? "urbanSuccess"
                        : "success"
                      : (snapshot.result ?? "ended"),
                  )}
            </p>
            {phase === "ended" &&
              rule &&
              ["yield", "lane", "stop"].includes(snapshot.result ?? "") && (
                <a className="drive-source" href={sources[rule.source].url}>
                  {ui.source[l]} · {rule.name[l]} ↗
                </a>
              )}
          </div>
          <button className="button" onClick={start}>
            {text(phase === "ready" ? "start" : "retry")} <Icon name="arrow" />
          </button>
        </div>
      ) : (
        <>
          <div className="drive-controls">
            {(
              [
                "left",
                "right",
                "brake",
                "gas",
                ...(urban ? (["lookLeft", "lookRight"] as const) : []),
              ] as const
            ).map((k) => (
              <button
                key={k}
                type="button"
                disabled={phase !== "active"}
                className={"pedal " + k}
                aria-label={text(k)}
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  held.current.set("p" + e.pointerId, k);
                }}
                onLostPointerCapture={(e) =>
                  held.current.delete("p" + e.pointerId)
                }
                onPointerUp={(e) => held.current.delete("p" + e.pointerId)}
                onPointerCancel={(e) => held.current.delete("p" + e.pointerId)}
                onKeyDown={(e) => {
                  if (["Enter", "Space"].includes(e.code)) {
                    e.preventDefault();
                    held.current.set("button" + e.code, k);
                  }
                }}
                onKeyUp={(e) => held.current.delete("button" + e.code)}
                onBlur={() => {
                  held.current.delete("buttonSpace");
                  held.current.delete("buttonEnter");
                }}
              >
                <b aria-hidden="true">
                  {
                    {
                      left: "←",
                      right: "→",
                      brake: "▥",
                      gas: "↑",
                      lookLeft: "↶",
                      lookRight: "↷",
                    }[k]
                  }
                </b>
                <span>{text(k)}</span>
              </button>
            ))}
          </div>
        </>
      )}
      <p className="drive-help">
        {text("controls")} {urban && text("lookHelp")}
      </p>
    </section>
  );
}
