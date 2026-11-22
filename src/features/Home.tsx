import { HeroArt, ModeArt } from "../components/Art";
import { Icon } from "../components/Icon";
import { descriptions, modeIds, Stats, type T } from "../components/Shared";
import { questions, rules } from "../content";
import { scenes } from "../content/scenes";
import { type History } from "../lib/game";
const tags = {
  learn: "practice",
  quiz: "assessment",
  situations: "challenge",
} as const;
const number = (n: number) => String(n).padStart(2, "0");
export function Home({ t, data }: { t: T; data: History }) {
  return (
    <>
      <section className="hero">
        <HeroArt />
        <div className="hero-copy">
          <div className="kicker light">
            <i />
            {t("eyebrow")}
          </div>
          <h1>
            {t("hero1")}
            <br />
            <em>{t("hero2")}</em>
          </h1>
          <p>{t("intro")}</p>
          <a className="button warm" href="#/learn">
            {t("start")} <Icon name="arrow" />
          </a>
        </div>
      </section>
      <div className="section-heading">
        <div className="kicker">
          <i />
          {t("modes")}
        </div>
        <h2>{t("choose")}</h2>
      </div>
      <div className="modes">
        {modeIds.map((m) => (
          <a className={"mode " + m} href={"#/" + m} key={m}>
            <ModeArt mode={m} />
            <div className="mode-body">
              <small className="kicker">{t(tags[m])}</small>
              <h3>{t(m)}</h3>
              <p>{t(descriptions[m])}</p>
              <span className="mode-end">
                <span>
                  {number(
                    m === "learn"
                      ? rules.filter((r) => r.asset).length
                      : m === "quiz"
                        ? questions.length
                        : Object.keys(scenes).length,
                  )}{" "}
                  {t(m === "situations" ? "scenes" : "questions")}
                </span>
                <b>
                  <Icon name="arrow" />
                </b>
              </span>
            </div>
          </a>
        ))}
      </div>
      <div className="section-heading row">
        <h2>{t("report")}</h2>
        <a href="#/progress">{t("progress")} →</a>
      </div>
      <Stats data={data} t={t} />
      <a className="atlas-link" href="#/catalogue">
        <Icon name="catalogue" />
        {t("open")} <Icon name="arrow" />
      </a>
    </>
  );
}
