/** @typedef {import('@playwright/test').Page} Page */
import config from "../config/env.js";

export class LoginPage {
  /**
   * @param {Page} page
   */
  constructor(page) {
    // All Login Page locators
    this.page = page;
    this.mobileNumberField = page.locator("input[formcontrolname='mobileNo']");
    this.signInWithOTP = page.locator("//button[text()='Sign In With OTP']");
    this.inputFields = page.locator("div.col input");
    this.otpInputs = page.locator("div.col input");
    this.submitOTP = page.locator("//button[text()='Submit OTP']");
  }

  // All action methods
  async navigateTOURL() {
    await this.page.goto(config.BASEURL + "/auth/login", {
      waitUntil: "load",
    });
    console.info("Navigated to Login URL");
  }

  async loginWithUser(mobileNumber, otpToEnter) {
    let enteredMobileNumber = mobileNumber;
    try {
      await this.mobileNumberField.fill(mobileNumber);
      console.info(`Login with mobile number as ${enteredMobileNumber}`);
      await this.signInWithOTP.click();
      await this.page.waitForSelector("div.col input", { timeout: 60000 });
      const OTP = otpToEnter;
      for (let i = 0; i < OTP.length; i++) {
        await this.otpInputs.nth(i).fill(OTP[i]);
      }
      await this.submitOTP.click();
      console.info("User Gets Logged in Successfully");
    } catch (err) {
      console.error("Exception Caught While Login :- ", err);
      throw err;
    }
  }
}
