import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against the real client + server dev servers.
 * Not executed as part of `npm run build` — start both dev servers first
 * (`npm run dev`), or let Playwright's webServer option below start them.
 *
 * First-time setup: `npx playwright install --with-deps chromium`
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run dev --workspace=server",
      url: "http://localhost:4000/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npm run dev --workspace=client",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
