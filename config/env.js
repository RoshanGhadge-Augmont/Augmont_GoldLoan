const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Determine which environment to load
// Priority 1: process.env.ENV (from OS environment variable like: set ENV=uat)
// Priority 2: --env= flag from command line (like: npx playwright test --env=uat)
// Priority 3: default to "test"
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

  // Priority 3: Default fallback
  return "test";
};

const ENV = getEnvironment();

// Ensure ENV is set for consistency in process.env
process.env.ENV = ENV;

// Step 1: Load base .env (if exists) - only common settings
const baseEnvPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(baseEnvPath)) {
  dotenv.config({ path: baseEnvPath });
}

// Step 2: Load environment-specific file (overrides base)
// This is the ONLY file that should override, ensuring correct env is used
const envSpecificPath = path.resolve(__dirname, `../.env.${ENV}`);
if (fs.existsSync(envSpecificPath)) {
  dotenv.config({
    path: envSpecificPath,
    override: true,
  });
} else {
  console.warn(`Warning: .env.${ENV} not found at ${envSpecificPath}`);
}

// Step 3: Load .env.local for secrets (if it exists) - ONLY if explicitly provided
const localEnvPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(localEnvPath)) {
  dotenv.config({
    path: localEnvPath,
    override: true,
  });
}

// Create a Proxy that reads from process.env at runtime (not at import time)
// This ensures environment changes are always reflected when accessing config properties
const config = new Proxy(
  {},
  {
    get(target, prop) {
      switch (prop) {
        case "env":
          return process.env.ENV;
        case "BASEURL":
          return process.env.BASE_URL;
        case "USEREMAIL":
          return process.env.USER_MOBILENUMBER;
        case "USERPASSWORD":
          return process.env.USER_PASSWORD;
        case "HEADLESS":
          return process.env.HEADLESS;
        case "TIMEOUT":
          return parseInt(process.env.TIMEOUT);
        case "RETRYCOUNT":
          return parseInt(process.env.RETRY_COUNT);
        default:
          return undefined;
      }
    },
  },
);

export default config;
