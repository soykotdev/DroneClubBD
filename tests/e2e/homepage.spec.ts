import { test, expect } from "@playwright/test";

// Requires a running MongoDB (server/.env pointed at a real or local
// instance) since the homepage's Core Services section fetches from the
// API. Run `npm run seed --workspace=server` first so services render.

test("homepage loads with hero, primary navigation and a working CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Drone Club Bangladesh/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Inspect Smarter/i);

  await page.getByRole("link", { name: "Request an Inspection" }).first().click();
  await expect(page).toHaveURL(/\/request-inspection$/);
  await expect(page.getByRole("heading", { name: "Request an Inspection" })).toBeVisible();
});

test("mobile menu opens, traps focus, and closes on Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Desktop viewport shows the inline nav instead of the menu button");
  await page.goto("/");

  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeHidden();
});

test("unknown route renders the 404 page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
});
