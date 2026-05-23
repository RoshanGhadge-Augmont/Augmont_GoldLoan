import { test } from "@playwright/test";
import logCred from "../test-data/loginCred.json";
import { poManager } from "../pages/poManager";

test("Login to panel with admin credentials", async ({ browser }) => {
  const context = await browser.newContext();
  const newPage = await context.newPage();
  const poManagerObj = new poManager(newPage);
  const LoginPageObj = poManagerObj.getLoginPage();

  await LoginPageObj.navigateTOURL();
  await LoginPageObj.loginWithUser(
    logCred.AdminLogin.mobileNumber,
    logCred.AdminLogin.OTP,
  );

  await newPage.waitForLoadState("networkidle");
  // After successful login and we are storing its session state file
  await context.storageState({
    path: "storage-states/adminUserAuthDetails.json",
  });
  console.info("Admin user authentication details are saved");
  await newPage.close();
});
