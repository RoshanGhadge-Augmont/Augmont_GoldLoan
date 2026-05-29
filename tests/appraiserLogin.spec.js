import { test } from "@playwright/test";
import { poManager } from "../pages/poManager";

const logCred = JSON.parse(process.env.LOGIN_CREDENTIALS);

test("Login to panel with admin credentials", async ({ browser }) => {
  const context = await browser.newContext();
  
  const newPage = await context.newPage();
  const poManagerObj = new poManager(newPage);
  const LoginPageObj = poManagerObj.getLoginPage();

  await LoginPageObj.navigateTOURL();
  await LoginPageObj.loginWithUser(
    logCred.OperationLogin.mobileNumber,
    logCred.OperationLogin.OTP,
  );

  await newPage.waitForLoadState("networkidle");
  // After successful login and we are storing its session state file
  await context.storageState({
    path: "storage-states/opsUserAuthDetails.json",
  });
  console.info("Operation user authentication details are saved");
  await newPage.close();
});
