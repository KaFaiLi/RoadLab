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
