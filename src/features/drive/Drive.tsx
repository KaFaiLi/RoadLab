import { useEffect, useState, useRef } from "react";
import { tr, type Locale } from "../../content/schema";
import { fieldGroups, fieldText } from "../../content/fieldDrives";
import { skillText, lessonText } from "../../content/drivingLessons";
import type { DriveRecord } from "../../lib/game";
import { Icon } from "../../components/Icon";
import { neutral, type Controls } from "./simulation";
import { districts } from "./urban";
import { urbanCopy } from "./urbanCopy";
import { copy } from "./strings";
import { render } from "./render";
import { createJourney, advanceJourney, journeyWorld } from "./journey";
import "./drive.css";

const strings = {
  ...copy,
  ...urbanCopy,
  ...fieldText,
  ...lessonText,
  openRoad: tr("Open road", "自由駕駛", "フリードライブ"),
  overview: tr(
    "Keep left and follow the turn directions. Read the signs and watch the traffic. Pause when you want to end your drive.",
    "靠左行駛並依提示轉彎，留意道路標誌與車流。想結束行程時請按暫停。",
    "左側を走り、案内に沿って曲がりましょう。標識や交通の流れに注意し、終了するときは一時停止してください。",
  ),
  straight: tr("Continue ahead", "繼續直行", "道なりに直進"),
  goLeft: tr("← Turn left at the junction", "← 在路口左轉", "← 交差点を左折"),
  goRight: tr("Turn right at the junction →", "在路口右轉 →", "交差点を右折 →"),
  endTrip: tr("End drive", "結束駕駛", "運転を終了"),
  tripSummary: tr("Trip summary", "行程回顧", "走行記録"),
  travelled: tr("Distance driven", "行駛距離", "走行距離"),
  incidents: tr("Incidents", "事件次數", "注意を受けた回数"),
};
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
export default function Drive({
  l,
  recordDrive,
}: {
  l: Locale;
  recordDrive: (r: DriveRecord) => void;
}) {
  const [session] = useState(() => ({ current: createJourney() }));
  const [phase, setPhase] = useState<Phase>("ready"),
    [available, setAvailable] = useState(true);
  const canvas = useRef<HTMLCanvasElement>(null),
    held = useRef(new Map<string, Input>());
  const view = () => {
    const j = session.current;
    return {
      street: j.street,
      distance: Math.floor(j.distance),
      car: { ...j.car },
      warning: j.time < j.warningUntil ? j.warning : null,
      incidents: j.incidents,
      skills: [...j.skills],
    };
  };
  const [snapshot, setSnapshot] = useState(view);
  const text = (k: keyof typeof strings) => strings[k][l];
  useEffect(() => {
    const el = canvas.current,
      ctx = el?.getContext("2d", { alpha: false });
    if (!el || !ctx) {
      setAvailable(false);
      return;
    }
    let look = 0,
      frame = 0,
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
        // Keep braking and actor motion in sync when a mobile frame runs long.
        const elapsed = Math.min(0.25, dt),
          steps = Math.max(1, Math.ceil(elapsed / 0.05));
        for (let i = 0; i < steps; i++)
          advanceJourney(session.current, keys, elapsed / steps, look);
        if (time - reported > 95) {
          setSnapshot(view());
          reported = time;
        }
      }
      const { car, street } = session.current;
      render(
        ctx,
        w,
        h,
        car,
        journeyWorld(session.current),
        street.route,
        street.route === "cycle" && look < 0 ? look * 2.2 : look,
        false,
        street.field,
        street.weather,
      );
      last = time;
      if (phase === "active") frame = requestAnimationFrame(paint);
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
  }, [phase, session]);
  const { street, car } = snapshot;
  const turn = street.route === "town" ? 0 : districts[street.route].turn;
  const direction =
    turn && turn * car.x < 12 ? (turn < 0 ? "goLeft" : "goRight") : "straight";
  function start() {
    if (phase === "ended") {
      session.current = createJourney();
      setSnapshot(view());
    }
    setPhase("active");
  }
  function end() {
    const j = session.current;
    recordDrive({
      route: "journey",
      variant: 0,
      at: Date.now(),
      completed: true,
      distance: Math.floor(j.distance),
      incidents: j.incidents,
      skills: [...j.skills],
    });
    setSnapshot(view());
    setPhase("ended");
  }
  return (
    <section className="driving">
      <div className="drive-head">
        <div>
          <small className="kicker">
            <Icon name="road" />
            {text("openRoad")}
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
        <canvas ref={canvas} role="img" aria-label={text("fieldView")} />
        {street.route === "cycle" && (
          <small className="mirror-label">{text("mirror")}</small>
        )}
        <div className="drive-hud">
          <div>
            <i />
            <span>{text(direction)}</span>
          </div>
          <strong aria-label={text("travelled")}>{snapshot.distance} m</strong>
        </div>
        {snapshot.warning && phase === "active" && (
          <p role="status" className="trip-warning">
            {text(snapshot.warning)}
          </p>
        )}
        {phase === "paused" && (
          <div className="drive-shade">
            <div className="trip-actions">
              <button className="button warm" onClick={start}>
                {text("resume")} ▸
              </button>
              <button className="drive-secondary" onClick={end}>
                {text("endTrip")}
              </button>
            </div>
          </div>
        )}
      </div>
      {!available ? (
        <p role="alert">{text("unavailable")}</p>
      ) : phase === "ready" || phase === "ended" ? (
        <div className="drive-brief">
          <div>
            {phase === "ready" ? (
              <p>{text("overview")}</p>
            ) : (
              <>
                <h2>{text("tripSummary")}</h2>
                <p>
                  {text("travelled")} · {snapshot.distance} m<br />
                  {text("incidents")} · {snapshot.incidents}
                </p>
                {snapshot.skills.length > 0 && (
                  <ul>
                    {snapshot.skills.map((k) => (
                      <li key={k}>{skillText[k][l]}</li>
                    ))}
                  </ul>
                )}
              </>
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
                "lookLeft",
                "lookRight",
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
      {phase === "active" && street.field && (
        <small>{fieldGroups[street.field.group][l]}</small>
      )}
      <p className="drive-help">
        {text("controls")} {text("lookHelp")}
      </p>
    </section>
  );
}
