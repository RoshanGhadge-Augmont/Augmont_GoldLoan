import { test, expect } from "@playwright/test";
import { poManager } from "../pages/poManager";
import { generateRandomMobileNumber } from "../commonUtils/randomDataUtility.js";
// const userData = require("../test-data/addCustomerDetails.json");
import {
  readInput,
  writeOutput,
  resetOutput,
  readOutput,
} from "../commonUtils/dataManagerUtility.js";
import * as allure from "allure-js-commons";
import config from "../config/env.js";
import { logger } from "../commonUtils/loggerHelperUtility.js";

const logCred = JSON.parse(process.env.LOGIN_CREDENTIALS);

let webContext;
let newPage;

test.describe(`Customer KYC Flow --> `, async () => {
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
          logCred.AdminLogin.mobileNumber,
          logCred.AdminLogin.OTP,
        );

        await newPage.waitForURL("**/welcome**", { timeout: 8000 });
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

  test("Customer KYC Flow", async () => {
    test.setTimeout(120000);
    // Alllure Report Configurations
    await allure.owner("Roshan Ghadge");
    await allure.tags("Admin Panel", "Customer KYC Flow");
    await allure.severity("Medium");

    logger.start(`[Test Started]: Started flow for customer KYC`);
    // Read Data from json file
    const {
      state,
      city,
      permanantAddress,
      landMark,
      motherName,
      fatherName,
      gender,
      maritalStatus,
      religion,
    } = readInput("addCustomerDetails");
    const { customerId } = readOutput("addCustomerDetails");

    // object creation and calling action methods
    // const customerId = "MP3NSXQZ";
    const poManagerObj = new poManager(newPage);
    const AddCustomerpageObj = poManagerObj.getAddCustomerPage();
    const CustomerKYCPageObj = poManagerObj.getCustomerKYCPage();

    console.info("On Customer KYC Screen for customer :- ", customerId);

    await CustomerKYCPageObj.navigateToAllCustomerPage();
    await CustomerKYCPageObj.getcustomerDetails(customerId);
    await CustomerKYCPageObj.SearchCustomerInitiateKYCFlow(customerId);
    await CustomerKYCPageObj.waitForKYCBasicDetailsTab();
    await CustomerKYCPageObj.fillKYCBasicDetails();
    await CustomerKYCPageObj.waitForKYCAddressAndIdentityTab();
    await CustomerKYCPageObj.dismissLocationPopupIfVisible();
    await CustomerKYCPageObj.fillAddressIdentity(
      state,
      city,
      permanantAddress,
      landMark,
    );
    await CustomerKYCPageObj.waitForPersonalDetailsTab();
    await CustomerKYCPageObj.fillPersonalDetails(
      motherName,
      fatherName,
      gender,
      maritalStatus,
      religion,
    );
    await CustomerKYCPageObj.waitForReviewandSubmitDetailsTab();
    await CustomerKYCPageObj.submitDetails();
    await CustomerKYCPageObj.navigateToAppliedKYCPage();
    await CustomerKYCPageObj.clickOnActionButton();
    await CustomerKYCPageObj.validateKYCDetails();
    await CustomerKYCPageObj.customerClassficationTabApproval();
    logger.success(`[Test Success]: Customer KYC has been completed `);
  });

  test.afterEach(async ({}) => {
    try {
      await newPage.waitForTimeout(4000);
      await newPage.close();
      await webContext.close();
      console.info(
        `Browser Context and Page has been closed successfully in customerKYC test`,
      );
    } catch (err) {
      console.error(
        "Caught exception in afterEach for closing the browser & page in customerKYC test:- ",
        err,
      );
      throw err;
    }
  });
});
