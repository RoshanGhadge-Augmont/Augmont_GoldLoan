import { test, expect } from "@playwright/test";
import { poManager } from "../pages/poManager";
// import logCred from "../test-data/loginCred.json";
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

const cleanupBrowserSession = async () => {
  if (newPage && !newPage.isClosed()) {
    await newPage.close().catch((err) => {
      console.warn("Failed to close page during cleanup:", err);
    });
  }

  if (webContext) {
    await webContext.close().catch((err) => {
      console.warn("Failed to close browser context during cleanup:", err);
    });
  }

  newPage = undefined;
  webContext = undefined;
};

test.describe("Initiating a gold loan request for customer flow -->", async () => {
  test.beforeEach(async ({ browser }) => {
    // initial setup for the user to be gets logged in directly with the help of userAuth.json

    try {
      webContext = await browser.newContext({
        storageState: "storage-states/adminUserAuthDetails.json",
        permissions: ["geolocation", "camera", "microphone"],
        args: [
          "--use-fake-ui-for-media-stream",
          "--use-fake-device-for-media-stream",
        ],
        geolocation: { latitude: 19.076, longitude: 72.8777 },
      });
      newPage = await webContext.newPage();

      await webContext.grantPermissions(
        ["geolocation", "camera", "microphone"],
        {
          origin: config.BASEURL,
        },
      );
      await newPage.goto(config.BASEURL + "/admin/welcome", {
        waitUntil: "load",
      });
      console.info("Fetched URL Successfully");

      const currentURL = newPage.url();
      const poManagerObj = new poManager(newPage);
      const loginPageObj = poManagerObj.getLoginPage();

      if (currentURL.includes("/welcome")) {
        console.info(
          "New browser context with the new page as already logged in user",
        );
      } else if (currentURL.includes("/auth/login")) {
        await loginPageObj.navigateTOURL();
        await loginPageObj.loginWithUser(
          logCred.AdminLogin.mobileNumber,
          logCred.AdminLogin.OTP,
        );

        await expect(newPage).toHaveURL(/\/welcome/, { timeout: 15000 });
        await webContext.storageState({
          path: "storage-states/adminUserAuthDetails.json",
        });
        console.info("Login Successful and Session Storage saved successfully");
      } else {
        console.info(`Unexpected URL, Now Again initiating a force login`);
        await newPage.goto(config.BASEURL + "/auth/login", {
          waitUntil: "networkidle",
        });
        await loginPageObj.loginWithUser(
          logCred.AdminLogin.mobileNumber,
          logCred.AdminLogin.OTP,
        );
        await expect(newPage).toHaveURL(/\/welcome/, { timeout: 15000 });
        await webContext.storageState({
          path: "storage-states/adminUserAuthDetails.json",
        });
        console.info(
          "Force Login Successful and Session Storage saved successfully ",
        );
      }

      if (!newPage.url().includes("/welcome")) {
        throw new Error("Login failed: browser did not reach /welcome page.");
      }
    } catch (err) {
      console.error(
        "Caught Exception in beforeEach block while setting up browsercontext & newpage:-",
        err,
      );
      await cleanupBrowserSession();
      throw err;
    }
  });

  test("Selecting a customer and initiating a new gold loan", async () => {
    test.setTimeout(120000);
    // Allure report configuration
    await allure.owner("Roshan Ghadge");
    await allure.tags("Admin Panel", "Initiating a new gold loan for customer");
    await allure.severity("Medium");

    logger.start(
      `[Test Started]: Started flow for initiating new gold loan for customer`,
    );
    // Reading data from json file for execution
    const { customerId } = readOutput("addCustomerDetails");
    const { branch, leadConverter } = readInput("addCustomerDetails");

    // const customerId = "MP3NSXQZ";
    const poManagerObj = new poManager(newPage);
    const initiateGoldLoanPageObj = poManagerObj.getInitiateGoldLoanPage();
    await initiateGoldLoanPageObj.navigateToAllCustomerPage();
    await initiateGoldLoanPageObj.changeBranch(branch);
    await initiateGoldLoanPageObj.getCustomerIDToInitiateGoldLoan(
      customerId,
      leadConverter,
    );
    await initiateGoldLoanPageObj.verifyGoldLoanRequestCreated();
    logger.success(
      `[Test Success]: Customer gold loan application request has been completed successfully`,
    );
  });

  test.afterEach(async () => {
    try {
      await cleanupBrowserSession();
      console.info(
        "Browser Context and Page has been closed sucessfully in initiateGoldLoan test",
      );
    } catch (err) {
      console.error(
        "Caught exception in afterEach for closing the browser & page  on initiateGoldLoan Test:- ",
        err,
      );
    }
  });
});
