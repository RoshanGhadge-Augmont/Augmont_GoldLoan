import { expect, test } from "@playwright/test";
// import logCred from "../test-data/loginCred.json";
import { poManager } from "../pages/poManager.js";
import {
  readInput,
  writeOutput,
  resetOutput,
  readOutput,
} from "../commonUtils/dataManagerUtility.js";
import config from "../config/env.js";
import { logger } from "../commonUtils/loggerHelperUtility.js";
import * as allure from "allure-js-commons";
const logCred = JSON.parse(process.env.LOGIN_CREDENTIALS);

let webContext;
let newPage;

test.describe("Submitting the Packet Details for loan -->", async () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ browser }) => {
    // initial setup for the user to be gets logged in directly with the help of userAuth.json
    try {
      webContext = await browser.newContext({
        storageState: "storage-states/adminUserAuthDetails.json",
        permissions: ["geolocation", "camera", "microphone"],
        args: [
          "--use-fake-ui-for-media-stream",
          "--use-fake-device-for-media-stream",
          "--disable-print-preview",
          "--start-maximized",
        ],
        geolocation: { latitude: 19.076, longitude: 72.8777 },
      });
      newPage = await webContext.newPage();
      await newPage.goto(config.BASEURL + "/admin/welcome", {
        waitUntil: "load",
      });
      console.info(`Fetched URL Successfully`);

      const currentURL = newPage.url();
      const poManagerObj = new poManager(newPage);
      const loginPageObj = poManagerObj.getLoginPage();

      if (currentURL.includes("/welcome")) {
        console.info(
          "New browser context with the new page as already logged in user in beforeEach",
        );
      } else if (currentURL.includes("/auth/login")) {
        await loginPageObj.navigateTOURL();
        await loginPageObj.loginWithUser(
          logCred.AdminLogin.mobileNumber,
          logCred.AdminLogin.OTP,
        );

        await newPage.waitForURL("**/welcome**", { timeout: 8000 });
        await webContext.storageState({
          path: "storage-states/adminUserAuthDetails.json",
        });
        console.info(
          "Login Successful and Session Storage saved successfully in beforeEach",
        );
      } else {
        console.info(`Unexpected URL, Now Again initiating a force login`);
        await newPage.goto(config.BASEURL + "/auth/login", {
          waitUntil: "networkidle",
        });
        await loginPageObj.loginWithUser(
          logCred.AdminLogin.mobileNumber,
          logCred.AdminLogin.OTP,
        );
        await newPage.waitForURL("**/welcome**", { timeout: 10000 });
        await webContext.storageState({
          path: "storage-states/adminUserAuthDetails.json",
        });
        console.info(
          "Force Login Successful and Session Storage saved successfully ",
        );
      }
    } catch (err) {
      console.error(
        "Caught Exception in beforeEach block while setting up browsercontext & newpage:-",
        err,
      );
      throw err;
    }
  });

  test("Submitting the packet details", async () => {
    // Allure report configuration
    await allure.owner("Roshan Ghadge");
    await allure.tags("Admin Panel", "Submitting the packets of jewellery");
    await allure.severity("Medium");

    logger.start(`[Test Started]: Started flow packet submission`);

    // Read customerdetails .json file
    const { customerId } = readOutput("addCustomerDetails");
    const {
      OTP,
      partner,
      partnerBranch,
      partnerUser,
      partnerUserMobileNumber,
    } = readInput("addCustomerDetails");

    // const customerId = "MP3NSXQZ";
    const poManagerObj = new poManager(newPage);
    const submitPacketDetailsPageObj =
      poManagerObj.getSubmitPacketDetailsPage();
    await submitPacketDetailsPageObj.navigateToAppliedLoan();
    await submitPacketDetailsPageObj.changeDefaultBranch();
    await submitPacketDetailsPageObj.searchCustomerandClickSubmitPacket(
      customerId,
    );
    await submitPacketDetailsPageObj.fillDetailsIntoSubmitPacketDetailsPopup(
      partnerBranch,
      OTP,
      partnerUserMobileNumber,
      partnerUser,
    );
    logger.success(
      `[Test Success]: Packet submittion has been executed successfully`,
    );
  });

  test.afterEach(async () => {
    try {
      await newPage.waitForTimeout(4000);
      await newPage.close();
      await webContext.close();
      console.info(
        "Browser Context and Page has been closed sucessfully in submitPacketDetails test",
      );
    } catch (err) {
      console.error(
        "Caught exception in afterEach for closing the browser & page in submitPacketDetails test :- ",
        err,
      );
      throw err;
    }
  });
});
