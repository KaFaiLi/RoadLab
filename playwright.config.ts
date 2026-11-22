import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://127.0.0.1:4173/RoadLab/", locale: "en-US" },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { executablePath: process.env.CHROMIUM_PATH },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        launchOptions: { executablePath: process.env.CHROMIUM_PATH },
      },
    },
    ...(process.env.WEBKIT
      ? [{ name: "mobile-webkit", use: { ...devices["iPhone 13"] } }]
      : []),
  ],
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173/RoadLab/",
  },
});
