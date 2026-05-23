import { test, expect } from "@playwright/test";
import logCred from "../test-data/loginCred.json";
import { poManager } from "../pages/poManager";
import {
  readInput,
  writeOutput,
  resetOutput,
  readOutput,
} from "../commonUtils/dataManagerUtility.js";
import config from "../config/env.js";
import * as allure from "allure-js-commons";
import { logger } from "../commonUtils/loggerHelperUtility.js";

let webContext;
let newPage;

test.describe("Operation Team Approval For Loan", async () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ browser }) => {
    // initial setup for the user to be gets logged in directly with the help of userAuth.json
    try {
      webContext = await browser.newContext({
        storageState: "storage-states/opsUserAuthDetails.json",
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
          logCred.RoshanOperationLogin.mobileNumber,
          logCred.RoshanOperationLogin.OTP,
        );

        await newPage.waitForURL("**/welcome**", { timeout: 8000 });
        await webContext.storageState({
          path: "storage-states/opsUserAuthDetails.json",
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
          logCred.RoshanOperationLogin.mobileNumber,
          logCred.RoshanOperationLogin.OTP,
        );
        await newPage.waitForURL("**/welcome**", { timeout: 10000 });
        await webContext.storageState({
          path: "storage-states/opsUserAuthDetails.json",
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

  test("Operation Team Approval", async () => {
    test.setTimeout(240000);

    // Allure report configurations
    await allure.owner("Roshan Ghadge");
    await allure.tags(
      "Admin Panel",
      "Operation team approval for customer loan application ",
    );
    await allure.severity("Medium");

    logger.start(
      `[Test Started]: Started flow for operation team approval of customer loan `,
    );

    // Read customerdetails .json file
    const { customerId } = readOutput("addCustomerDetails");

    // const customerId = "MP3NSXQZ";
    const poManagerObj = new poManager(newPage);
    const operationTeamApprovalPageObj =
      poManagerObj.getOperationTeamApprovalPage();
    await operationTeamApprovalPageObj.navigateToAppliedLoan();
    await operationTeamApprovalPageObj.changeDefaultBranch();
    await operationTeamApprovalPageObj.searchCustomerandClickOperationRating(
      customerId,
    );
    await operationTeamApprovalPageObj.waitForBasicDetailTabAndClickNext();
    await operationTeamApprovalPageObj.waitForNomieeDetailsTabAndClickNext();
    await operationTeamApprovalPageObj.waitForJewelleryDetailsTabAndClickNext();
    await operationTeamApprovalPageObj.waitForFICDetailsTabAndClickNext();
    await operationTeamApprovalPageObj.waitForBankDetailsTabAndClickNext();
    await operationTeamApprovalPageObj.waitForPacketDetailsTabAndClickNext();
    await operationTeamApprovalPageObj.waitForDocumentUploadTabAndClickNext();
    await operationTeamApprovalPageObj.waitForLoanApprovalTab();
    await operationTeamApprovalPageObj.opsTeamApproval();
    logger.success(
      `[Test Success]: Opration team approval test has been completed successfully`,
    );
  });

  test.afterEach(async () => {
    try {
      await newPage.waitForTimeout(4000);
      await newPage.close();
      await webContext.close();
      console.info(
        "Browser Context and Page has been closed sucessfully in operationTeamApproval test",
      );
    } catch (err) {
      console.error(
        "Caught exception in afterEach for closing the browser & page in operationTeamApproval test :- ",
        err,
      );
      throw err;
    }
  });
});
