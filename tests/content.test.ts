import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { validate, rules, questions } from "../src/content";
import { scenes } from "../src/content/scenes";
import { sources } from "../src/content/sources";
import { ui } from "../src/content/ui";
import { translation } from "../src/content/schema";
describe("published inventory", () => {
  it("has complete linked entries, source metadata, translations and artwork", () => {
    expect(questions.length).toBeGreaterThanOrEqual(20);
    expect(
      new Set(questions.map((q) => q.scene).filter(Boolean)).size,
    ).toBeGreaterThanOrEqual(6);
    for (const r of rules) {
      expect(sources[r.source].url).toMatch(/^https:/);
      if (r.asset)
        expect(existsSync("public/assets/signs/" + r.asset + ".png")).toBe(
          true,
        );
    }
    for (const v of Object.values(ui)) translation.parse(v);
    for (const id of Object.keys(scenes))
      expect(questions.some((q) => q.scene === id)).toBe(true);
  });
  it("rejects duplicate IDs, dangling links, missing locales and conflicting publication status", () => {
    const q = questions[0],
      r = rules[0];
    for (const bad of [
      { ...q, options: [q.options[0], q.options[0]] },
      { ...q, correct: "missing" },
      { ...q, scene: "missing" },
      { ...q, rule: "missing" },
      { ...q, prompt: { en: "only" } },
    ])
      expect(() => validate(rules, [bad])).toThrow();
    expect(() => validate([...rules, r], questions)).toThrow();
    expect(() => validate(rules, [q, q])).toThrow();
    expect(() => validate([{ ...r, status: "pending" }], [q])).toThrow();
  });
});
