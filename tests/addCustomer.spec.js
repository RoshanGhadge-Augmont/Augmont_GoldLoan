import { test, expect, browser } from "@playwright/test";
import { poManager } from "../pages/poManager";
import { generateRandomMobileNumber } from "../commonUtils/randomDataUtility.js";
// import userData from "../test-data/addCustomerDetails.json";
import {
  readInput,
  writeOutput,
  resetOutput,
  cleanAllureReports,
} from "../commonUtils/dataManagerUtility.js";
import config from "../config/env.js";
import * as allure from "allure-js-commons";
import { logger } from "../commonUtils/loggerHelperUtility.js";

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

test.describe("Add New Customer Flow --> ", async () => {
  test.beforeAll(() => {
    resetOutput("addCustomerDetails");
    cleanAllureReports();
  });

  test.beforeEach(async ({ browser }) => {
    // initial setup for the user to be gets logged in directly with the help of userAuth.json
    try {
      webContext = await browser.newContext({
        storageState: "storage-states/adminUserAuthDetails.json",
      });
      newPage = await webContext.newPage();
      await newPage.goto(config.BASEURL + "/admin/welcome", {
        waitUntil: "networkidle",
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
        console.info(
          "Existing session is expired now reinitiating a login flow",
        );
        await loginPageObj.navigateTOURL();
        await loginPageObj.loginWithUser(
          logCred.AdminLogin.mobileNumber,
          logCred.AdminLogin.OTP,
        );

        await expect(newPage).toHaveURL(/\/welcome/, { timeout: 15000 });
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

  test("Adding  new customer", async ({ browser }) => {
    // Test Execution Timeout
    test.setTimeout(240000);
    // await allure.displayName("Add New Customer");
    await allure.owner("Roshan Ghadge");
    await allure.tags("Admin Panel", "Add New Customer");
    await allure.severity("Medium");

    logger.start(`[Test Started]: Started flow for adding new customer`);

    // Read Data from json file
    const {
      firstName,
      lastName,
      pincode,
      OTP,
      branch,
      leadConverter,
      state,
      city,
    } = readInput("addCustomerDetails");

    // page Objects to action methods
    const poManagerObj = new poManager(newPage);
    const AddCustomerPageObj = poManagerObj.getAddCustomerPage();

    await AddCustomerPageObj.changeDefaultBranch(branch);
    await AddCustomerPageObj.navigateToAddCustomerPage();
    await AddCustomerPageObj.addNewCustomer(
      firstName,
      lastName,
      OTP,
      pincode,
      leadConverter,
      state,
      city,
    );
    const customerId = await AddCustomerPageObj.fetchUserIdOfCustomer(pincode);
    console.info(
      "Fetched Customer Id Into addCustomerPage:-",
      customerId.trim(),
    );
    logger.success(
      `[Test Success]: Customer has been added and stored its customer id successfully`,
    );
  });

  test.afterEach(async () => {
    try {
      await cleanupBrowserSession();
      console.info(
        "Browser Context and Page has been closed sucessfully in addCustomer test",
      );
    } catch (err) {
      console.error(
        "Caught exception in afterEach for closing the browser & page in addCustomer test :- ",
        err,
      );
    }
  });
});
