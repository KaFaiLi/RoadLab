import { useState } from "react";
import { ModeArt, Scene } from "../components/Art";
import { Icon } from "../components/Icon";
import {
  artUrl,
  Breakdown,
  Category,
  descriptions,
  Source,
  type Mode,
  type T,
} from "../components/Shared";
import { questions, ruleFor } from "../content";
import { type Locale, type Question } from "../content/schema";
import {
  mistakes,
  score,
  select,
  type Attempt,
  type History,
} from "../lib/game";
function Review({ a, t, l }: { a: Attempt; t: T; l: Locale }) {
  const q = questions.find((q) => q.id === a.id);
  if (!q) return null;
  const r = ruleFor(q);
  return (
    <article className="review">
      <h3>{q.prompt[l]}</h3>
      <p>
        {t("yours")} · {q.options.find((o) => o.id === a.answer)?.text[l]}
      </p>
      <strong>
        {t("answer")} · {q.options.find((o) => o.id === q.correct)?.text[l]}
      </strong>
      <p>{r.meaning[l]}</p>
      <Source r={r} t={t} />
    </article>
  );
}
export function Game({
  mode,
  l,
  t,
  data,
  record,
}: {
  mode: Mode;
  l: Locale;
  t: T;
  data: History;
  record: (a: Attempt, last?: History["last"]) => void;
}) {
  const [cat, setCat] = useState("all"),
    [diff, setDiff] = useState("all"),
    [count, setCount] = useState(5),
    [session, setSession] = useState<Question[]>([]),
    [idx, index] = useState(0),
    [answers, setAnswers] = useState<Attempt[]>([]),
    [done, finish] = useState(false);
  const wrong = mistakes(data.attempts);
  const pool = questions.filter(
    (q) =>
      (mode === "learn"
        ? !!ruleFor(q).asset
        : mode === "situations"
          ? !!q.scene
          : mode === "review"
            ? wrong.has(q.id)
            : true) &&
      (cat === "all" || ruleFor(q).category === cat) &&
      (diff === "all" || diff === q.difficulty),
  );
  const title = t(mode),
    q = session[idx];
  function start() {
    setSession(select(pool, count));
    index(0);
    setAnswers([]);
    finish(false);
  }
  function advance() {
    if (idx === session.length - 1) finish(true);
    else index(idx + 1);
  }
  const selected = answers[idx];
  function answer(id: string) {
    if (selected) return;
    const a = {
      id: q.id,
      answer: id,
      correct: id === q.correct,
      at: Date.now(),
    };
    const updated = [...answers, a];
    setAnswers(updated);
    record(
      a,
      idx === session.length - 1
        ? { right: score(updated), total: updated.length }
        : undefined,
    );
    if (mode === "quiz") advance();
  }
  if (done)
    return (
      <div className="narrow">
        <div className="kicker">{title}</div>
        <h1>{t("results")}</h1>
        <div className="result">
          {score(answers)} <span>/ {answers.length}</span>
        </div>
        <h2>{t("mastery")}</h2>
        <Breakdown items={answers} t={t} />
        <h2>{t("review")}</h2>
        {answers.every((a) => a.correct) && <p>{t("empty")}</p>}
        {answers
          .filter((a) => !a.correct)
          .map((a) => (
            <Review key={a.id} {...{ a, l, t }} />
          ))}
        <button
          className="button"
          onClick={() => {
            setSession([]);
            finish(false);
          }}
        >
          {t("again")}
        </button>
      </div>
    );
  if (!q)
    return (
      <div className="narrow">
        <ModeArt mode={mode === "review" ? "quiz" : mode} />
        <h1>{title}</h1>
        <p>{mode === "review" ? t("review") : t(descriptions[mode])}</p>
        <div className="panel filters">
          <Category t={t} value={cat} onChange={setCat} />
          <label>
            {t("difficulty")}
            <select value={diff} onChange={(e) => setDiff(e.target.value)}>
              {(["all", "basic", "applied"] as const).map((k) => (
                <option key={k} value={k}>
                  {t(k)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("count")}
            <select value={count} onChange={(e) => setCount(+e.target.value)}>
              {[1, 3, 5, 10, 20].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
        <p>
          {t("pool")} · {pool.length}{" "}
          {pool.length > 0 &&
            " · " + t("count") + " " + Math.min(pool.length, count)}
        </p>
        {!pool.length && <p>{t(mode === "review" ? "empty" : "none")}</p>}
        <button className="button" disabled={!pool.length} onClick={start}>
          {t("begin")} <Icon name="arrow" />
        </button>
      </div>
    );
  const r = ruleFor(q);
  return (
    <div className="narrow">
      <div className="kicker">
        {title} · {idx + 1} / {session.length}
      </div>
      <progress value={idx + 1} max={session.length} />
      {q.scene && <Scene id={q.scene} label={t("scene") + " · " + r.name[l]} />}
      <article className="question">
        {r.asset && <img className="sign" src={artUrl(r)} alt={r.name.ja} />}
        <small>
          {t(r.category)} · {t(r.kind)}
        </small>
        <h2>{q.prompt[l]}</h2>
        <div className="options">
          {q.options.map((o, i) => (
            <button
              key={o.id}
              disabled={!!selected}
              className={
                selected
                  ? o.id === q.correct
                    ? "right"
                    : o.id === selected.answer
                      ? "wrong"
                      : ""
                  : ""
              }
              onClick={() => answer(o.id)}
            >
              <b>{String.fromCharCode(65 + i)}</b>
              {o.text[l]}
            </button>
          ))}
        </div>
        {selected && (
          <div role="status">
            <h3>{t(selected.correct ? "correct" : "incorrect")}</h3>
            <p>
              {t("answer")} ·{" "}
              {q.options.find((o) => o.id === q.correct)?.text[l]}
            </p>
            <p>{r.meaning[l]}</p>
            <Source r={r} t={t} />
            <button className="button" onClick={advance}>
              {t(idx === session.length - 1 ? "finish" : "next")}
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
