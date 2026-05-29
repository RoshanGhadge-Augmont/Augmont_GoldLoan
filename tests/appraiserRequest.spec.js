import { test, expect } from "@playwright/test";
// import logCred from "../test-data/loginCred.json";
import { poManager } from "../pages/poManager";
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

test.describe("Initiating a appraiser Request for customer --> ", async () => {
  test.beforeEach(async ({ browser }) => {
    // initial setup for the user to be gets logged in directly with the help of userAuth.json

    try {
      webContext = await browser.newContext({
        storageState: "storage-states/appraiserUserAuthDetails.json",
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

      await webContext.grantPermissions(
        ["geolocation", "camera", "microphone"],
        {
          origin: config.BASEURL,
        },
      );
      await newPage.goto(config.BASEURL + "/admin/welcome", {
        waitUntil: "load",
      });
      console.info(`Fetched URL Successfully`);

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
          logCred.AppraiserLogin.mobileNumber,
          logCred.AppraiserLogin.OTP,
        );

        await expect(newPage).toHaveURL(/\/welcome/, { timeout: 15000 });
        await webContext.storageState({
          path: "storage-states/appraiserUserAuthDetails.json",
        });
        console.info("Login Successful and Session Storage saved successfully");
      } else {
        console.info(`Unexpected URL, Now Again initiating a force login`);
        await newPage.goto(config.BASEURL + "/auth/login", {
          waitUntil: "networkidle",
        });
        await loginPageObj.loginWithUser(
          logCred.AppraiserLogin.mobileNumber,
          logCred.AppraiserLogin.OTP,
        );
        await expect(newPage).toHaveURL(/\/welcome/, { timeout: 15000 });
        await webContext.storageState({
          path: "storage-states/appraiserUserAuthDetails.json",
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
        "Caught Exception in beforeEach block while setting up browser context & newpage in appraiser request page:-",
        err,
      );
      await cleanupBrowserSession();
      throw err;
    }
  });

  test("Validating loan appraiser request and start new gold loan", async ({
    browser,
  }) => {
    test.setTimeout(240000);
    // Allure report configuration
    await allure.owner("Roshan Ghadge");
    await allure.tags("Admin Panel", "New Appraiser Request For gold loan");
    await allure.severity("Medium");

    logger.start(`[Test Started]: Started flow for adding new customer`);
    // Read customerdetails .json file
    const { customerId } = readOutput("addCustomerDetails");
    const {
      nomineeName,
      nomineeAge,
      loanAmount,
      loanType,
      nomineeRelation,
      ornament1,
      ornament1Pieces,
      ornament1GrossWeight,
      ornament1DeductionWeight,
      ornament1Karat,
      ornament1Purity,
      ornament2,
      ornament2Pieces,
      ornament2GrossWeight,
      ornament2DeductionWeight,
      ornament2Karat,
      ornament2Purity,
      partner,
      schemeName,
    } = readInput("addCustomerDetails");

    // const customerId = "MP3R6GGM";
    const poManagerObj = new poManager(newPage);
    const appraserRequestPageObj = poManagerObj.getAppraiserRequestPage();
    await appraserRequestPageObj.navigateTOAppraiserRequest();
    await appraserRequestPageObj.changeDefaultBranch();
    await appraserRequestPageObj.searchCustomerIdandApplyLoan(customerId);
    await appraserRequestPageObj.fillLoanBasicDetails(loanType);
    await appraserRequestPageObj.waitForNomineeDetailsTab();
    await appraserRequestPageObj.fillLoanNomineeDetails(
      nomineeName,
      nomineeRelation,
      nomineeAge,
    );
    await appraserRequestPageObj.waitForJewelleryDetailsTab();
    await appraserRequestPageObj.fillLoanJewelleryDetailsTab(
      ornament1,
      ornament1Pieces,
      ornament1GrossWeight,
      ornament1DeductionWeight,
      ornament1Karat,
      ornament1Purity,
      ornament2,
      ornament2Pieces,
      ornament2GrossWeight,
      ornament2DeductionWeight,
      ornament2Karat,
      ornament2Purity,
    );
    await appraserRequestPageObj.waitForFICDetailsTab();
    await appraserRequestPageObj.fillLoanFICDetailsTab(
      partner,
      loanAmount,
      schemeName,
    );
    await appraserRequestPageObj.waitForBankDetailsTab();
    await appraserRequestPageObj.fillLoanBankDetails();
    await appraserRequestPageObj.waitForPacketDetailsTab();
    await appraserRequestPageObj.fillLoanPacketDetails();
    logger.success(
      `[Test Success]: Customer appriaser request has been completed successfully`,
    );
  });

  test.afterEach(async ({}) => {
    try {
      await cleanupBrowserSession();
      console.info(
        "Browser context and page has been closed successfully at appraiser Request test",
      );
    } catch (err) {
      console.error(
        "Caught exception in afterEach for closing the browser & page in appraiserRequest test :- ",
        err,
      );
    }
  });
});
