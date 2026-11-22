import { test, expect } from "@playwright/test";
import questions from "../../src/content/questions.json" with { type: "json" };
test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await page.locator(".language select").selectOption("en");
});
test("dashboard, languages, catalogue search, filter, artwork and hard refresh", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", { name: "Choose your route" }),
  ).toBeVisible();
  await page.getByLabel("Language").selectOption("ja");
  await expect(
    page.getByRole("heading", { name: "学習コースを選ぶ" }),
  ).toBeVisible();
  await page.locator(".language select").selectOption("zh-Hant");
  await expect(
    page.getByRole("heading", { name: "選擇學習路線" }),
  ).toBeVisible();
  await page.locator(".language select").selectOption("en");
  await page.getByRole("link", { name: "Catalogue", exact: true }).click();
  await page.reload();
  await page.getByLabel("Category").selectOption("regulatory");
  await page.getByRole("searchbox").fill("一時停止");
  await expect(page.locator(".inventory article")).toHaveCount(1);
  expect(
    await page
      .locator("img.sign")
      .evaluate((el) => (el as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  await page.getByRole("searchbox").fill("xxxx");
  await expect(page.getByText("No matching items.")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("learn a mistaken sign, review it, persist progress and reset", async ({
  page,
}) => {
  await page.goto("./#/learn");
  await page.getByLabel("Session length").selectOption("1");
  await page.getByRole("button", { name: "Begin session" }).click();
  const prompt = await page.locator(".question h2").innerText();
  const q = questions.find((q) => q.prompt.en === prompt)!;
  await page
    .getByRole("button", { name: q.options[1].text.en, exact: false })
    .click();
  await expect(page.getByRole("heading", { name: "Incorrect" })).toBeVisible();
  await page.getByRole("button", { name: "See results" }).click();
  await expect(page.locator(".review")).toHaveCount(1);
  await page.getByRole("link", { name: "Progress", exact: true }).click();
  await page.reload();
  await expect(page.locator(".stats")).toContainText("0/1");
  await page.getByRole("link", { name: /Mistake review/ }).click();
  await page.getByRole("button", { name: "Begin session" }).click();
  await page
    .getByRole("button", { name: q.options[0].text.en, exact: false })
    .click();
  await page.getByRole("button", { name: "See results" }).click();
  await page.goto("./#/progress");
  await expect(page.getByText("No mistakes to review.")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset progress" }).click();
  await expect(
    page.getByText("Complete a session to see your score."),
  ).toBeVisible();
});
test("assessment defers feedback and reports a complete score", async ({
  page,
}) => {
  await page.goto("./#/quiz");
  await page.getByLabel("Session length").selectOption("3");
  await page.getByRole("button", { name: "Begin session" }).click();
  for (let i = 0; i < 3; i++) {
    await expect(page.locator(".question [role=status]")).toHaveCount(0);
    await page.locator(".options button").first().click();
  }
  await expect(
    page.getByRole("heading", { name: "Session results" }),
  ).toBeVisible();
  await expect(page.locator(".result")).toContainText("/ 3");
  await expect(
    page.getByRole("heading", { name: "Accuracy by category" }),
  ).toBeVisible();
});
test("play a winter road scene", async ({ page }) => {
  await page.goto("./#/situations");
  await page.getByLabel("Category").selectOption("winter");
  await page.getByLabel("Session length").selectOption("1");
  await page.getByRole("button", { name: "Begin session" }).click();
  await expect(
    page.getByRole("img", { name: /Illustrated driving situation/ }),
  ).toBeVisible();
  await page.locator(".options button").first().click();
  await expect(page.locator(".question .source a")).toHaveAttribute(
    "href",
    /winter_drive/,
  );
  await page.getByRole("button", { name: "See results" }).click();
  await expect(
    page.getByRole("heading", { name: "Session results" }),
  ).toBeVisible();
});
