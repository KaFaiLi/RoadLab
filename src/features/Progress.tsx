import { skillText, lessonText, type Skill } from "../content/drivingLessons";
import { useState } from "react";
import { Breakdown, Stats, type T } from "../components/Shared";
import { questions } from "../content";
import { type Locale } from "../content/schema";
import { historySchema, mistakes, type History } from "../lib/game";
export function Progress({
  l,
  t,
  data,
  update,
}: {
  l: Locale;
  t: T;
  data: History;
  update: (fn: (d: History) => History) => void;
}) {
  const [msg, setMsg] = useState("");
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "roadlab-progress.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <h1>{t("progress")}</h1>
      <Stats data={data} t={t} />
      {!data.attempts.length && <p>{t("noattempt")}</p>}
      <h2>{t("mastery")}</h2>
      <Breakdown items={data.attempts} t={t} />
      <h2>{t("review")}</h2>
      {mistakes(data.attempts).size ? (
        <a href="#/review" className="button">
          {t("review")} ({mistakes(data.attempts).size}) →
        </a>
      ) : (
        <p>{t("empty")}</p>
      )}
      <h2>{lessonText.skills[l]}</h2>
      <p>
        {lessonText.runs[l]} ·{" "}
        {(data.drives ?? []).filter((d) => d.completed).length} /{" "}
        {(data.drives ?? []).length}
      </p>
      <ul>
        {(Object.keys(skillText) as Skill[]).map((k) => {
          const count = data.drives?.filter((d) => d.skills.includes(k)).length;
          return count ? (
            <li key={k}>
              {skillText[k][l]} · {count}
            </li>
          ) : null;
        })}
      </ul>
      <h2>{t("settings")}</h2>
      <p>{t("saved")}</p>
      <div className="actions">
        <button onClick={download}>{t("export")}</button>
        <label>
          {t("import")}
          <input
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                const next = historySchema.parse(JSON.parse(await file.text()));
                if (
                  next.attempts.some((a) => {
                    const q = questions.find((q) => q.id === a.id);
                    return (
                      !q ||
                      !q.options.some((o) => o.id === a.answer) ||
                      a.correct !== (q.correct === a.answer)
                    );
                  })
                )
                  throw Error();
                if (confirm(t("replace"))) update(() => next);
                setMsg("");
              } catch {
                setMsg(t("bad"));
              }
            }}
          />
        </label>
        <button
          onClick={() => {
            if (confirm(t("confirm")))
              update(() => ({
                version: 1,
                locale: l,
                attempts: [],
                last: null,
              }));
          }}
        >
          {t("reset")}
        </button>
      </div>
      <p role="status">{msg}</p>
    </>
  );
}
