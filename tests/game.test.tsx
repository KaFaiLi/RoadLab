import { it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import App from "../src/App";
import { questions } from "../src/content";
import {
  select,
  read,
  save,
  storageKey,
  score,
  mistakes,
  preferred,
} from "../src/lib/game";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});
it("samples without repeats, bounds session size and shuffles answer order", () => {
  const s = select(questions, 200, () => 0);
  expect(new Set(s.map((q) => q.id)).size).toBe(questions.length);
  expect(s[0].options[0].id).not.toBe("a");
  expect(select([], 3)).toEqual([]);
  expect(select(questions, -1)).toEqual([]);
});
it("tracks latest unresolved mistakes and counts all answers", () => {
  const a = { id: "1", answer: "a", at: 1, correct: false },
    b = { ...a, correct: true };
  expect(mistakes([a, b]).size).toBe(0);
  expect(score([a, b])).toBe(1);
});
it("recovers when storage contains invalid data or denies writes", () => {
  localStorage.setItem(storageKey, "{");
  expect(read().error).toBe(true);
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw Error();
  });
  expect(save(read().data)).toBe(false);
});
it("defaults to Traditional Chinese unless a supported preference exists", () => {
  expect(preferred(["fr"])).toBe("zh-Hant");
  expect(preferred(["fr", "ja-JP"])).toBe("ja");
});
it("renders all three working mode links", () => {
  render(<App />);
  for (const route of ["learn", "quiz", "situations"])
    expect(
      screen
        .getAllByRole("link")
        .some((a) => a.getAttribute("href") === "#/" + route),
    ).toBe(true);
});
