const dotenv = require("dotenv");
const path = require("path");

// Determine which environment to load
const ENV = process.env.ENV || "test";

// Step 1: Load base .env (defaults)
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

// Step 2: Load environment-specific file (overrides base)
dotenv.config({
  path: path.resolve(__dirname, `../.env.${ENV}`),
  override: true,
});

// Step 3: Load .env.local for secrets (overrides everything)
dotenv.config({
  path: path.resolve(__dirname, "../.env.TEST"),
  override: true,
});

const config = {
  env: process.env.ENV || "TEST",
  BASEURL: process.env.BASE_URL || "https://ap.gfat.augmont.com",
  USEREMAIL: process.env.USER_MOBILENUMBER || "9819228963",
  USERPASSWORD: process.env.USER_PASSWORD || "Mnb@123",
  HEADLESS: process.env.HEADLESS !== "False",
  TIMEOUT: parseInt(process.env.TIMEOUT) || 30000,
  RETRYCOUNT: parseInt(process.env.RETRY_COUNT) || 0,
};

export default config;
