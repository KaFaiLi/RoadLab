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
import "./drive.css";
type Phase = "ready" | "active" | "paused" | "ended";
const keyMap: Record<string, keyof Controls> = {
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
  const canvas = useRef<HTMLCanvasElement>(null),
    car = useRef(spawn()),
    held = useRef(new Map<string, keyof Controls>());
  const [phase, setPhase] = useState<Phase>("ready"),
    [snapshot, setSnapshot] = useState(() => ({ ...car.current })),
    [available, setAvailable] = useState(true);
  const text = (k: keyof typeof copy) => copy[k][l];
  useEffect(() => {
    const el = canvas.current,
      ctx = el?.getContext("2d", { alpha: false });
    if (!el || !ctx) {
      setAvailable(false);
      return;
    }
    const world = makeWorld();
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
        for (const name of held.current.values()) keys[name] = true;
        drive(car.current, keys, last ? (time - last) / 1000 : 0);
        if (time - reported > 90 || car.current.result) {
          setSnapshot({ ...car.current });
          reported = time;
        }
      }
      render(ctx, w, h, car.current, world);
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
  }, [phase]);
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
      car.current = spawn();
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
            {text("route")} · 150 m
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
      <div className="windshield">
        <canvas ref={canvas} role="img" aria-label={text("view")} />
        <div className="drive-hud">
          <div>
            <i />
            <span aria-live="polite">{text(stage)}</span>
          </div>
          {stage !== "wait" && <strong>{distance} m</strong>}
        </div>
        {phase === "paused" && (
          <div className="drive-shade">
            <button className="button warm" onClick={start}>
              {text("resume")} ▸
            </button>
          </div>
        )}
      </div>
      <progress
        aria-label={text("route")}
        value={Math.min(course.finish, Math.max(0, snapshot.z + 2))}
        max={course.finish}
      />
      {!available ? (
        <p role="alert">{text("unavailable")}</p>
      ) : phase === "ready" || phase === "ended" ? (
        <div className="drive-brief">
          <div>
            {phase === "ended" && (
              <h2>
                {text(snapshot.result === "complete" ? "complete" : "ended")}
              </h2>
            )}
            <p>
              {phase === "ready"
                ? text("brief")
                : text(
                    snapshot.result === "complete"
                      ? "success"
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
        <div className="drive-controls">
          {(["left", "right", "brake", "gas"] as const).map((k) => (
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
                {{ left: "←", right: "→", brake: "▥", gas: "↑" }[k]}
              </b>
              <span>{text(k)}</span>
            </button>
          ))}
        </div>
      )}
      <p className="drive-help">{text("controls")}</p>
    </section>
  );
}
