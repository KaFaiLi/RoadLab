import { useEffect, useState } from "react";
import { Icon, type IconName } from "./components/Icon";
import { type Mode, type T } from "./components/Shared";
import { locales, type Locale } from "./content/schema";
import { ui } from "./content/ui";
import { Catalogue } from "./features/Catalogue";
import { Game } from "./features/Game";
import { Home } from "./features/Home";
import { Progress } from "./features/Progress";
import { read, save } from "./lib/game";
const route = () => location.hash.replace(/^#\/?/, "") || "home";
export default function App() {
  const [initial] = useState(read),
    [data, setData] = useState(initial.data),
    [error, setError] = useState(initial.error),
    [page, setPage] = useState(route);
  useEffect(() => {
    function change() {
      setPage(route());
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.documentElement.lang = data.locale;
    if (data !== initial.data) setError(!save(data));
  }, [data, initial]);
  const l = data.locale,
    t: T = (k) => ui[k][l],
    props = { l, t, data };
  return (
    <>
      <header>
        <div className="bar">
          <a className="logo" href="#/home">
            <span>
              <Icon name="road" />
            </span>
            Road<span className="logo-lab">Lab</span>
          </a>
          <nav>
            {(["home", "catalogue", "progress"] as const).map((n) => (
              <a
                className={page === n ? "active" : ""}
                aria-current={page === n ? "page" : undefined}
                key={n}
                href={"#/" + n}
              >
                <Icon name={n as IconName} />
                {t(n)}
              </a>
            ))}
          </nav>
          <label className="language">
            <Icon name="globe" />
            <select
              aria-label={t("language")}
              value={l}
              onChange={(e) =>
                setData((d) => ({ ...d, locale: e.target.value as Locale }))
              }
            >
              {locales.map((x) => (
                <option key={x} value={x}>
                  {{ en: "English", "zh-Hant": "繁體中文", ja: "日本語" }[x]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>
      <main>
        {error && <p role="alert">{t("storage")}</p>}
        {page === "catalogue" ? (
          <Catalogue {...props} />
        ) : page === "progress" ? (
          <Progress {...props} update={setData} />
        ) : ["learn", "quiz", "situations", "review"].includes(page) ? (
          <Game
            key={page}
            mode={page as Mode}
            {...props}
            record={(a, last) =>
              setData((d) => ({
                ...d,
                attempts: [...d.attempts, a],
                last: last ?? d.last,
              }))
            }
          />
        ) : (
          <Home {...props} />
        )}
      </main>
      <footer>
        <b>RoadLab</b>
        <span>{t("footer")}</span>
      </footer>
    </>
  );
}
