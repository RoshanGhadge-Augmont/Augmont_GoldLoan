import { expect } from "@playwright/test";
import config from "../config/env";
import {
  readInput,
  writeOutput,
  resetOutput,
  readOutput,
} from "../commonUtils/dataManagerUtility.js";

/** @typedef {import('@playwright/test').Page} Page */
export class SubmitPacketDetailsPage {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;
    // Branch selection from profile
    this.profileIcon = this.page.locator(".kt-header__topbar-user");
    this.branchSelectionDropDown = this.page.locator(".profile-name select");

    // Applied Loan page objects
    this.searchCustomerField = this.page.getByPlaceholder(
      "Enter Customer Unique Id",
    );
    this.filterButton = this.page.locator("button[type='submit']");
    this.filterRow = this.page.locator("tbody.ui-table-tbody tr:first-child");
    this.submitPacketButton = this.filterRow.getByText("SUBMIT PACKET", {
      exact: true,
    });

    // Submit Packet Details ( Update Location ) popup
    this.submitPacketDetailsPopup = this.page.getByRole("heading", {
      name: "Update Location",
    });
    this.selectLocation = this.page.locator(
      "select[formcontrolname='packetLocationId']",
    );
    this.selectPartnerBranch = this.page.locator(
      "select[formcontrolname='partnerBranchId']",
    );
    this.packetID = this.page.locator(
      "div.row>div.col-7.d-flex.align-items-center",
    );
    this.barCodeField = this.page.locator("input[formcontrolname='Barcode']");
    this.verifyButton = this.page
      .locator("button")
      .filter({ hasText: "Verify" });
    this.verifiedButton = page.locator('span:has-text("Verified")');

    this.partnerUserMobileNumberField = this.page.locator(
      "input[formcontrolname='mobileNumber']",
    );
    this.userLabel = this.page.locator("//label[normalize-space()='User']");
    this.partnerUserName = this.page.locator(
      "input[formcontrolname='user'][ng-reflect-name='user']",
    );
    this.sendOTPButton = this.page.getByText("Send OTP", { exact: true });
    this.enterOTPField = this.page.locator("input[formcontrolname='otp']");
    this.updateButton = this.page.getByText("Update", { exact: true });
  }

  // Action Action Methods
  async navigateToAppliedLoan() {
    await this.page.goto(
      config.BASEURL + "/admin/loan-management/applied-loan",
      { waitUntil: "load" },
    );
    console.info("Navigated to the applied loan page");
  }

  async changeDefaultBranch() {
    console.info("Started flow for selecting all branches from dropdown");
    await this.profileIcon.click();
    await this.branchSelectionDropDown.click();
    await this.branchSelectionDropDown.selectOption({
      label: "Show All",
    });
    await this.page.waitForTimeout(2000);
    console.info("For Admin -> Show all branches is selected");
  }

  async searchCustomerandClickSubmitPacket(customerId) {
    await this.searchCustomerField.fill(customerId);
    console.info(`Searched with the ${customerId} on applied loan page`);
    await this.page.waitForTimeout(2000);
    await this.filterButton.click();
    await this.page.waitForTimeout(2000);
    await this.submitPacketButton.waitFor({ state: "visible", timeout: 10000 });
    await this.submitPacketButton.click({ force: true });
    console.info(`Filter > Submit packet details button is clicked`);
  }

  async fillDetailsIntoSubmitPacketDetailsPopup(
    partnerBranch,
    OTP,
    partnerUserMobileNumber,
    partnerUser,
  ) {
    await expect(this.submitPacketDetailsPopup).toBeVisible();
    await this.selectLocation.selectOption({ value: "4" });
    await this.page.waitForTimeout(1500);
    // Need to update value here
    await this.selectPartnerBranch.selectOption({ label: partnerBranch });
    let fetchedPacketID = await this.packetID.textContent();
    console.info(
      `Fetched packet id for the loan is:- ${fetchedPacketID.trim()}`,
    );

    await this.barCodeField.fill(fetchedPacketID.trim());
    writeOutput("addCustomerDetails", { packetID: fetchedPacketID.trim() });
    console.info(`Packet id is enterd correctly into field`);
    await this.verifyButton.click();
    await expect(this.verifiedButton).toBeVisible();
    console.info(`Partner Mobile Number fetched is ${partnerUserMobileNumber}`);
    await this.partnerUserMobileNumberField.fill(partnerUserMobileNumber);
    await this.userLabel.click();
    await this.page.waitForTimeout(1500);
    let fetchedPartnerUserName = await this.partnerUserName.inputValue();
    console.info(
      "Fetched partner user name from the submit packet details pop up is:- ",
      fetchedPartnerUserName.trim(),
    );
    await expect(this.partnerUserName).toHaveValue(
      new RegExp(partnerUser.trim(), "i"),
    );
    console.info(`Correct partner name has been reflected`);
    await this.sendOTPButton.click();
    await this.page.waitForTimeout(1500);
    await this.enterOTPField.fill(OTP);
    await this.page.waitForTimeout(1500);
    await this.verifyButton.click();
    await this.page.waitForTimeout(1500);
    // await expect(this.verifiedButton).toBeVisible();
    console.info("OTP has been verified");
    await this.updateButton.click();
    await this.page.waitForTimeout(1500);
    await expect(this.submitPacketDetailsPopup).not.toBeVisible();
    console.info(
      "All the packet details has been sumbitted correctly and submit packet popup is closed",
    );
  }
}
