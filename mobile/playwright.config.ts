import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.ts",
  workers: 1,
  timeout: 90000,
  webServer: {
    command: "npm run web -- --port 8081",
    url: "http://127.0.0.1:8081",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  use: {
    baseURL: "http://127.0.0.1:8081",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
      args: ["--no-sandbox"],
    },
    screenshot: "only-on-failure",
    video: "on",
  },
  reporter: "list",
});
