import { expect } from "@playwright/test";

export async function ClickPicture(page, cameraPreview, takePicture) {
  try {
    await cameraPreview.waitFor({
      state: "visible",
      timeout: 5000,
    });

    await expect(takePicture).toBeVisible();
    console.info(`camera preview is visible on screen`);

    await page.waitForTimeout(1500);
    await takePicture.click();
    await page.waitForTimeout(1500);

    await cameraPreview.waitFor({
      state: "hidden",
      timeout: 5000,
    });

    console.info(`picture is clicked and camera preview is hidden`);
  } catch (err) {
    console.error(`Getting error while capturing the photo ${err}`);
  }
}
