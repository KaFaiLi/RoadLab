import { Icon } from "../components/Icon";
import { questions, ruleFor } from "../content";
import { categories, type Rule } from "../content/schema";
import { sources } from "../content/sources";
import { ui } from "../content/ui";
import { score, type Attempt, type History } from "../lib/game";
type K = keyof typeof ui;
export type T = (k: K) => string;
export type Mode = "learn" | "quiz" | "situations" | "review";
export const modeIds = ["learn", "quiz", "situations"] as const;
export const descriptions = {
  learn: "ld",
  quiz: "qd",
  situations: "sd",
} as const;
const percent = (a: Attempt[]) =>
  a.length ? Math.round((score(a) * 100) / a.length) + "%" : "—";
export const artUrl = (r: Rule) =>
  import.meta.env.BASE_URL + "assets/signs/" + r.asset + ".png";
export function Source({ r, t }: { r: Rule; t: T }) {
  return (
    <small className="source">
      {t("verified")} · {r.checked} ·{" "}
      <a href={sources[r.source].url} target="_blank" rel="noreferrer">
        {sources[r.source].title} ↗
      </a>{" "}
      · {r.section}
    </small>
  );
}
export function Stats({ data, t }: { data: History; t: T }) {
  return (
    <div className="stats">
      {(
        [
          ["flag", "attempted", String(data.attempts.length)],
          ["target", "accuracy", percent(data.attempts)],
          [
            "progress",
            "recent",
            data.last ? data.last.right + "/" + data.last.total : "—",
          ],
        ] as const
      ).map(([icon, label, value]) => (
        <div key={label}>
          <span className="stat-icon">
            <Icon name={icon} />
          </span>
          <span>
            <small>{t(label)}</small>
            <b>{value}</b>
          </span>
        </div>
      ))}
    </div>
  );
}
export function Category({
  value,
  onChange,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  t: T;
}) {
  return (
    <label>
      {t("category")}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">{t("all")}</option>
        {categories.map((c) => (
          <option value={c} key={c}>
            {t(c)}
          </option>
        ))}
      </select>
    </label>
  );
}
export function Breakdown({ items, t }: { items: Attempt[]; t: T }) {
  return (
    <div className="breakdown">
      {categories.map((c) => {
        const ids = new Set(
          questions.filter((q) => ruleFor(q).category === c).map((q) => q.id),
        );
        const a = items.filter((x) => ids.has(x.id));
        return a.length ? (
          <div key={c}>
            <span>{t(c)}</span>
            <progress max={100} value={(score(a) * 100) / a.length} />
            <b>
              {score(a)}/{a.length}
            </b>
          </div>
        ) : null;
      })}
    </div>
  );
}
