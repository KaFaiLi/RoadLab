import { useState } from "react";
import { artUrl, Category, Source, type T } from "../components/Shared";
import { rules } from "../content";
import { type Locale } from "../content/schema";
import { sources } from "../content/sources";
export function Catalogue({ l, t }: { l: Locale; t: T }) {
  const [cat, setCat] = useState("all"),
    [query, setQuery] = useState("");
  const list = rules.filter(
    (r) =>
      (cat === "all" || r.category === cat) &&
      [...Object.values(r.name), r.meaning[l]]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <h1>{t("atlas")}</h1>
      <p>{t("full")}</p>
      <div className="filters">
        <label>
          {t("search")}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <Category t={t} value={cat} onChange={setCat} />
      </div>
      <p>
        {list.length} / {rules.length}
      </p>
      <div className="inventory">
        {list.map((r) => (
          <article key={r.id}>
            {r.asset && (
              <img className="sign" src={artUrl(r)} alt={r.name.ja} />
            )}
            <small className="kicker">
              {t(r.category)} · {t(r.kind)}
            </small>
            <h3>{r.name[l]}</h3>
            {l !== "ja" && <small lang="ja">{r.name.ja}</small>}
            <p>{r.meaning[l]}</p>
            <Source r={r} t={t} />
            {r.asset && (
              <small>
                <a href={sources.mlit.url}>{r.attribution}</a>
              </small>
            )}
          </article>
        ))}
      </div>
      {!list.length && <p>{t("none")}</p>}
    </>
  );
}
