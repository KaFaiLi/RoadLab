import { test, expect } from "@playwright/test";
test("enter the cockpit, drive with held controls, pause and resume", async ({
  page,
}) => {
  await page.goto("./");
  await page.locator(".language select").selectOption("en");
  await page.getByRole("link", { name: "3D Driving School" }).click();
  await page.reload();
  await expect(
    page.getByRole("img", { name: "Driver’s view of the town circuit" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start driving" }).click();
  const gas = page.getByRole("button", { name: "Accelerate" });
  const rect = (await gas.boundingBox())!;
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await expect
    .poll(async () =>
      Number(await page.locator(".driving progress").getAttribute("value")),
    )
    .toBeGreaterThan(3);
  await page.mouse.up();
  await page.getByRole("button", { name: /Pause/ }).click();
  const distance = await page
    .locator(".driving progress")
    .getAttribute("value");
  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(180);
  await page.keyboard.up("ArrowUp");
  await expect(page.locator(".driving progress")).toHaveAttribute(
    "value",
    distance!,
  );
  await page.getByRole("button", { name: /Resume drive/ }).click();
  await page.keyboard.down("KeyW");
  await expect
    .poll(async () =>
      Number(await page.locator(".driving progress").getAttribute("value")),
    )
    .toBeGreaterThan(Number(distance) + 0.6);
  await page.keyboard.up("KeyW");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: /Resume drive/ }),
  ).toBeVisible();
  await page.locator(".language select").selectOption("ja");
  await expect(
    page.getByRole("heading", { name: "3Dドライビングスクール" }),
  ).toBeVisible();
});

test("select independent urban turns, see matching vehicle and walk greens, and change routes while paused", async ({
  page,
}) => {
  await page.goto("./#/drive");
  await page.locator(".language select").selectOption("en");
  const route = page.getByLabel("Driving route");
  await route.selectOption("market");
  await expect(
    page.getByText("Turn left into the market street."),
  ).toBeVisible();
  await route.selectOption("avenue");
  await expect(
    page.getByText("Turn right across the opposing lane."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start driving" }).click();
  await expect(route).toBeDisabled();
  await expect(page.getByRole("button", { name: "Look right" })).toBeVisible();
  await expect(page.locator(".signal-strip .lens.green")).toHaveCount(3, {
    timeout: 24000,
  });
  await page.getByRole("button", { name: /Pause/ }).click();
  await route.selectOption("station");
  await expect(
    page.getByRole("button", { name: "Start driving" }),
  ).toBeVisible();
  await expect(page.locator(".signal-strip .lens.red")).toHaveCount(3);
});

test("debrief, replay variation and saved driving progress survive navigation and reload", async ({
  page,
}) => {
  await page.goto("./#/drive");
  await page.locator(".language select").selectOption("en");
  await page.getByLabel("Driving route").selectOption("avenue");
  await page.getByLabel("Encounter").selectOption("1");
  await page.getByRole("button", { name: "Start driving" }).click();
  await page.keyboard.down("w");
  await expect(
    page.getByRole("heading", { name: "Decision review" }),
  ).toBeVisible({ timeout: 15000 });
  await page.keyboard.up("w");
  await page.getByRole("button", { name: "Retry this encounter" }).click();
  await expect(page.getByLabel("Encounter")).toHaveValue("1");
  await page.keyboard.down("w");
  await expect(page.getByRole("heading", { name: "Drive ended" })).toBeVisible({
    timeout: 15000,
  });
  await page.keyboard.up("w");
  await page
    .getByRole("button", { name: "Practice another variation" })
    .click();
  await expect(page.getByLabel("Encounter")).toHaveValue("2");
  await page.goto("./#/progress");
  await page.reload();
  await expect(page.getByText("Completed drives · 0 / 2")).toBeVisible();
});
