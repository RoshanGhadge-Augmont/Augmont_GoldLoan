import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(__dirname, "../test-data");
const ROOT_DIR = process.cwd();

// ── Get the current environment ───────────────────────────────────────────────
// Priority 1: Check process.env.ENV from environment variable (set ENV=uat)
// Priority 2: Check --env= flag from command line (npx playwright test --env=uat)
// Priority 3: Default to "test"
function getEnvironment() {
  // Check environment variable first
  if (process.env.ENV) {
    return process.env.ENV.toLowerCase().trim();
  }

  // Check command line --env= argument
  const envArg = process.argv.find((arg) => arg.startsWith("--env="));
  if (envArg) {
    return envArg.split("=")[1].toLowerCase().trim();
  }

  // Default to test
  return "test";
}

// ── Get full file path with environment support ──────────────────────────────
// Priority: {fileName}.{ENV}.json → {fileName}.json
function getFilePath(fileName) {
  const env = getEnvironment();

  // Try environment-specific file first
  const envSpecificPath = path.join(DATA_DIR, `${fileName}.${env}.json`);
  if (fs.existsSync(envSpecificPath)) {
    console.log(`📋 Loaded data from: ${fileName}.${env}.json`);
    return envSpecificPath;
  }

  // Fall back to base file
  const basePath = path.join(DATA_DIR, `${fileName}.json`);
  if (fs.existsSync(basePath)) {
    console.log(`📋 Loaded data from: ${fileName}.json (base)`);
    return basePath;
  }

  throw new Error(
    `Test data file not found: ${fileName}.${env}.json or ${fileName}.json`,
  );
}

// ── Read input fields only ───────────────────────────────────────────────────
function readInput(fileName) {
  const filePath = getFilePath(fileName);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.input;
}

// ── Read output fields only ──────────────────────────────────────────────────
function readOutput(fileName) {
  const filePath = getFilePath(fileName);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.output;
}

// ── Write updates into output section only ───────────────────────────────────
function writeOutput(fileName, updates) {
  const filePath = getFilePath(fileName);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Validate: only allow keys that exist in output section
  const invalidKeys = Object.keys(updates).filter(
    (key) => !(key in data.output),
  );
  if (invalidKeys.length > 0) {
    throw new Error(
      `Invalid output key(s) for ${fileName}.json: ${invalidKeys.join(", ")}`,
    );
  }

  data.output = { ...data.output, ...updates };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`✅ Output written to ${fileName}.json →`, updates);
}

// ── Reset output fields to null before every test run ───────────────────────
function resetOutput(fileName) {
  const filePath = getFilePath(fileName);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Set every output field back to null, input is never touched
  data.output = Object.fromEntries(
    Object.keys(data.output).map((key) => [key, null]),
  );

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`🔄 Output reset for: ${fileName}.json`);
}

function cleanAllureReports() {
  const folders = ["allure-results", "allure-report"];

  folders.forEach((folder) => {
    const folderPath = path.join(ROOT_DIR, folder);

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, {
        recursive: true,
        force: true,
      });

      console.info(`🧹 Removed folder → ${folder}`);
    }
  });
}

export { readInput, readOutput, writeOutput, resetOutput, cleanAllureReports };
