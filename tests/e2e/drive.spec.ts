import { test, expect } from "@playwright/test";
test("start once, drive, pause, switch language, resume and save one trip", async ({
  page,
}) => {
  await page.goto("./");
  await page.locator(".language select").selectOption("en");
  await page.getByRole("link", { name: "3D Driving School" }).click();
  await page.reload();
  await expect(page.locator(".driving select")).toHaveCount(0);
  await page.getByRole("button", { name: "Start driving" }).click();
  const gas = page.getByRole("button", { name: "Accelerate" }),
    rect = (await gas.boundingBox())!;
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  const distance = () =>
    page.getByLabel("Distance driven").innerText().then(parseFloat);
  await expect.poll(distance).toBeGreaterThan(3);
  await page.mouse.up();
  await page.keyboard.press("Escape");
  const frozen = await distance();
  await page.keyboard.down("w");
  await page.waitForTimeout(200);
  await page.keyboard.up("w");
  expect(await distance()).toBe(frozen);
  await page.locator(".language select").selectOption("ja");
  await expect(page.getByRole("button", { name: "運転を再開" })).toBeVisible();
  await page.locator(".language select").selectOption("en");
  await page.getByRole("button", { name: /Resume drive/ }).click();
  await page.keyboard.down("w");
  await expect.poll(distance).toBeGreaterThan(frozen + 1);
  await page.keyboard.up("w");
  await page.getByRole("button", { name: /Pause/ }).click();
  await page.getByRole("button", { name: "End drive" }).click();
  await expect(
    page.getByRole("heading", { name: "Trip summary" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Drive again" }).click();
  await expect(page.getByRole("button", { name: /Pause/ })).toBeVisible();
  await page.goto("./#/progress");
  await page.reload();
  await expect(page.getByText("Completed drives · 1 / 1")).toBeVisible();
});
test("a missed railway stop gives feedback and keeps the driving controls live", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.68;
  });
  await page.goto("./#/drive");
  await page.locator(".language select").selectOption("en");
  await page.getByRole("button", { name: "Start driving" }).click();
  await page.keyboard.down("w");
  await expect(page.locator(".trip-warning")).toBeVisible({ timeout: 18000 });
  await page.keyboard.up("w");
  await expect(page.getByRole("button", { name: "Accelerate" })).toBeEnabled();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "End drive" }).click();
  await expect(page.locator(".drive-brief")).toContainText("Incidents · 1");
});
