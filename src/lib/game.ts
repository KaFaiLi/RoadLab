import { z } from "zod";
import { locales, type Locale, type Question } from "../content/schema";
export function shuffle<T>(items: readonly T[], random = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function select(pool: Question[], count: number, random = Math.random) {
  return shuffle(pool, random)
    .slice(0, Math.max(0, Math.floor(count)))
    .map((q) => ({ ...q, options: shuffle(q.options, random) }));
}
export const attemptSchema = z.object({
  id: z.string(),
  answer: z.string(),
  correct: z.boolean(),
  at: z.number(),
});
export type Attempt = z.infer<typeof attemptSchema>;
export const historySchema = z.object({
  version: z.literal(1),
  locale: z.enum(locales),
  attempts: z.array(attemptSchema),
  last: z
    .object({
      right: z.number().int().nonnegative(),
      total: z.number().int().positive(),
    })
    .nullable(),
});
export type History = z.infer<typeof historySchema>;
export const score = (a: Attempt[]) => a.filter((x) => x.correct).length;
export function mistakes(a: Attempt[]) {
  const latest = new Map(a.map((x) => [x.id, x.correct]));
  return new Set([...latest].filter(([, right]) => !right).map(([id]) => id));
}
export function preferred(langs: readonly string[]): Locale {
  for (const lang of langs) {
    const code = lang.split("-")[0];
    if (code === "en" || code === "ja") return code;
    if (code === "zh") return "zh-Hant";
  }
  return "zh-Hant";
}
export const storageKey = "roadlab.progress.v1";
export function read(): { data: History; error: boolean } {
  const empty: History = {
    version: 1,
    locale: preferred(navigator.languages),
    attempts: [],
    last: null,
  };
  try {
    const raw = localStorage.getItem(storageKey);
    return {
      data: raw ? historySchema.parse(JSON.parse(raw)) : empty,
      error: false,
    };
  } catch {
    return { data: empty, error: true };
  }
}
export function save(data: History) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
