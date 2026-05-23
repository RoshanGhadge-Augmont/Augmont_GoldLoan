import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(__dirname, "../test-data");
const ROOT_DIR = process.cwd();

// ── Get full file path ───────────────────────────────────────────────────────
function getFilePath(fileName) {
  const filePath = path.join(DATA_DIR, `${fileName}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test data file not found: ${fileName}.json`);
  }
  return filePath;
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
