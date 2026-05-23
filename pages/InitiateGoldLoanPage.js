import { expect } from "@playwright/test";
import config from "../config/env";

/** @typedef {import('@playwright/test').Page} Page */

export class InitiateGoldLoanPage {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;
    // Branch selection from profile
    this.profileIcon = this.page.locator(".kt-header__topbar-user");
    this.branchSelectionDropDown = this.page.locator(".profile-name select");

    // All customer page with search fields
    this.customerIdSearchField = this.page.getByPlaceholder(
      "Enter Customer Unique Id",
    );
    this.filterButton = this.page.getByText("Filter");

    // new gold loan create request
    this.goldLoanCreateRequestPopup = this.page.getByRole("heading", {
      name: "Create Request",
    });

    // Create Request Pop-Up elements
    this.customeridField = this.page.locator(
      '(//input[@formcontrolname="customerUniqueId"])[2]',
    );
    this.appraiserNameField = this.page.locator(
      'select[formcontrolname="appraiserId"]',
    );
    this.addButton = this.page.getByText("Add", { exact: true });

    // Appraiser Request after adding new loan request
    this.newLoanRequest = this.page.locator(
      'label:has-text("Appraiser Requests")',
    );
  }

  async navigateToAllCustomerPage() {
    await this.page.goto(config.BASEURL + "/admin/lead-management", {
      waitUntil: "load",
    });
    console.info("Navigated to the add customer Page");
  }

  async changeBranch(branch) {
    console.info("Started selecting branch from profile section");
    await this.profileIcon.click();
    await this.branchSelectionDropDown.selectOption({
      label: branch,
    });
    console.info(` ${branch} branch has been selected from the dropdown`);
  }

  async getCustomerIDToInitiateGoldLoan(customerID) {
    // Filtering out the customer from all customer page
    await this.customerIdSearchField.fill(customerID);
    await this.filterButton.click();
    await this.page.waitForTimeout(2000);
    const filteredRow = this.page
      .locator("tbody.ui-table-tbody > tr.ng-star-inserted")
      .filter({ hasText: customerID })
      .first();
    const applyKYCButton = filteredRow.getByRole("button", {
      name: "Apply KYC",
    });
    await expect(applyKYCButton).not.toBeVisible();
    console.info(
      "Found a customer with its customer Id with completed its kyc",
    );
    const moreOptionButton = filteredRow.getByText("more_vert", {
      exact: true,
    });
    const startNewGoldLoan = this.page.getByRole("menuitem", {
      name: "Start New Gold Loan",
    });

    await moreOptionButton.click();
    await expect(startNewGoldLoan).toBeVisible();
    await startNewGoldLoan.click();
    await expect(this.goldLoanCreateRequestPopup).toBeVisible();
    console.info("Create a gold loan request pop-up is visible");
    await this.appraiserNameField.selectOption({ value: "1388" });
    console.info("Appraiser is selected for the gold loan");
    await this.addButton.click();
    console.info("New gold loan request has been added successfully");
  }

  async verifyGoldLoanRequestCreated() {
    await expect(this.newLoanRequest).toBeVisible({ timeout: 2000 });
    console.info(
      "Appraiser Request tab is visible - Loan request is confirmed",
    );
  }
}
