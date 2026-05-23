import path from "node:path";
import fs from "fs";
import { expect } from "@playwright/test";

let filePath;

export async function uploadFile(page, locator, fileName) {
  const Attachments = path.resolve(process.cwd(), "test-data/Attachments/");

  try {
    filePath = path.join(Attachments, fileName);
    console.info(`Fetched file path into fileupload utility is ${filePath}`);
    if (fs.existsSync(filePath)) {
      console.info(`File Path exists in attachmentfolder`);

      const element =
        typeof locator === "string" ? page.locator(locator) : locator;
      await element.setInputFiles(filePath, { force: true });
      await page.waitForTimeout(2000);
    } else {
      console.info(`File path does not exists in attachment folder`);
      throw new Error(`File not found ${filePath}`);
    }
  } catch (err) {
    console.error("Exception caught while attaching the file");
    throw err;
  }
}
