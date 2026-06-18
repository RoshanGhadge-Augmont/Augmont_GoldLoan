import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import fileURLToPath from "url";
import path from "path";
import fs from "fs";
// ── Rebuild __dirname for ES modules ─────────────────────────────
// const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// NOTE: Do NOT load base .env here - let SECTION 2 handle all env loading
// dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * @see https://playwright.dev/docs/test-configuration
 *
 */

// ─────────────────────────────────────────────────────────────────
// playwright.config.js
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// SECTION 1 — ENVIRONMENT RESOLUTION
// Reads ENV=uat from OS environment variable
// Windows CMD : set ENV=uat  (then run npx on next line)
// Windows PS  : $env:ENV="uat"; npx playwright test
// Mac/Linux   : ENV=uat npx playwright test
// cross-env   : npx cross-env ENV=uat playwright test (all OS)
// ─────────────────────────────────────────────────────────────────

const getEnvironment = () => {
  // Priority 1: Check OS environment variable (set ENV=uat)
  if (process.env.ENV) {
    return process.env.ENV.toLowerCase().trim();
  }

  // Priority 2: Check --env= flag from command line (npx playwright test --env=uat)
  const envArg = process.argv.find((arg) => arg.startsWith("--env="));
  if (envArg) {
    return envArg.split("=")[1].toLowerCase().trim();
  }

  // Default fallback
  console.warn('WARNING: ENV not provided. Defaulting to "test".');
  return "test";
};

const ENV = getEnvironment();

// ⚠️ CRITICAL: Persist ENV to process.env so workers inherit it
process.env.ENV = ENV;

// ─────────────────────────────────────────────────────────────────
// SECTION 2 — DIRECTLY LOAD .env.{ENV} INTO PROCESS.ENV
// override: true forces our values to win over dotenvx injections
// ─────────────────────────────────────────────────────────────────

const envFilePath = path.resolve(__dirname, `.env.${ENV}`);

if (!fs.existsSync(envFilePath)) {
  console.error(`ERROR: ".env.${ENV}" file not found.`);
  console.error(`Make sure ".env.${ENV}" exists in the project root.`);
  process.exit(1);
}

// override: true ensures our file wins even if dotenvx
// already injected values from a different file
dotenv.config({ path: envFilePath, override: true });

console.log(`Running on  :  ${ENV.toUpperCase()}`);
console.log(`Base URL    :  ${process.env.BASE_URL}`);

// ─────────────────────────────────────────────────────────────────
// SECTION 3 — DIRECTLY READ loginCred.{ENV}.json AT RUNTIME
// Reads the correct credentials file based on --env flag
// Validates file exists, parses it, serializes into process.env
// Spec files just do JSON.parse(process.env.LOGIN_CREDENTIALS)
// No copying, no active slot file — direct read every time
// ─────────────────────────────────────────────────────────────────

const loginCredPath = path.resolve(
  __dirname,
  `test-data/loginCred.${ENV}.json`,
);

if (!fs.existsSync(loginCredPath)) {
  console.error(`ERROR: "loginCred.${ENV}.json" file not found.`);
  console.error(`Make sure the file exists at: ${loginCredPath}`);
  process.exit(1);
}

const loginCredentials = JSON.parse(fs.readFileSync(loginCredPath, "utf-8"));

// Serialize into process.env so every spec file can access it
// without needing to know the file path or the ENV value
process.env.LOGIN_CREDENTIALS = JSON.stringify(loginCredentials);

console.log(`Credentials :  loginCred.${ENV}.json  (loaded)`);

// ─────────────────────────────────────────────────────────────────
// SECTION 4 — PLAYWRIGHT CONFIGURATION
// ──────────────────────────────────────────────
export default defineConfig({
  timeout: 120000,
  actionsTimeout: 60000,
  // slowMo: 500,
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html"],
    [
      "allure-playwright",
      {
        detail: true,
        suiteTitle: "Augmont Gold Admin Panel",
        resultsDir: "allure-results",
        environmentInfo: {
          os: process.platform,
          node_version: process.version,
        },
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ignoreHTTPSErrors: true,
    permissions: ["geolocation", "camera", "microphone"],
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: null,
        deviceScaleFactor: undefined,
        launchOptions: {
          channel: "chrome",
          args: ["--start-maximized"],
          navigationTimeout: 60000,
        },
      },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          args: ["--start-maximized"],
          navigationTimeout: 60000,
        },
      },
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: null,
        launchOptions: {
          args: ["--start-maximized"],
          navigationTimeout: 60000,
        },
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
