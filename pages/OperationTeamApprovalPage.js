import { expect } from "@playwright/test";
import { AsyncLocalStorage } from "node:async_hooks";
import config from "../config/env";

/** @typedef {import('@playwright/test').Page} Page */
export class OperationTeamApprovalPage {
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
    this.opsRatingButton = this.filterRow.getByText("OPS TEAM RATING", {
      exact: true,
    });

    // All Tabs
    this.basicDetailsTab = this.page.getByText("Basic Details", {
      exact: true,
    });
    this.nomineeDetailsTab = this.page.getByText("Nominee Details", {
      exact: true,
    });
    this.jewelleryDetailsTab = this.page.locator(
      '(//div[@tabindex="0" and @role="tab"])[1]',
    );
    this.FICDetailsTab = this.page.getByText("Final Interest Calculator", {
      exact: true,
    });
    this.bankDetails = this.page.getByText("Bank Details", { exact: true });
    this.packetDetailsTab = this.page
      .locator("div")
      .filter({ hasText: "Packets" })
      .first();
    this.documentUploadTab = this.page
      .locator("div")
      .filter({ hasText: "Upload Documents" })
      .first();
    this.loanStatusApproval = this.page.getByText("Loan Status Approval", {
      exact: true,
    });

    // Next button
    this.nextButton = this.page.getByText("Next", { exact: true });

    // Loan Status Approval
    this.loanApplicationFormTick = this.page.locator(
      "img[name='incorrectApplicationFormForOperatinalTeam']",
    );
    this.goldValuationFormTick = this.page.locator(
      "img[name='incorrectGoldValuationForOperatinalTeam']",
    );
    this.opsTeamLoanStatus = this.page.locator(
      'select[formcontrolname="loanStatusForOperatinalTeam"]',
    );

    this.submitButton = this.page.getByText("Submit", { exact: true });
  }

  // All Action Methods
  async navigateToAppliedLoan() {
    await this.page.goto(
      config.BASEURL + "/admin/loan-management/applied-loan",
      { waitUntil: "load" },
    );
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

  async searchCustomerandClickOperationRating(customerId) {
    await this.searchCustomerField.fill(customerId);
    console.info(`Searched with the ${customerId} on applied loan page`);
    await this.page.waitForTimeout(2000);
    await this.filterButton.click();
    await this.page.waitForTimeout(2000);
    await this.opsRatingButton.waitFor({ state: "visible", timeout: 10000 });
    // await this.opsRatingButton.scrollIntoViewIfNeeded();
    await this.opsRatingButton.click({ force: true });
    console.info(`Filter > ops rating button is clicked`);
  }

  async waitForBasicDetailTabAndClickNext() {
    await expect(this.basicDetailsTab).toBeVisible({ timeout: 7000 });
    await this.nextButton.click();
    await this.page.waitForTimeout(1000);
    console.info(
      "Basic Detail tab is visible and in focus > clicked next button",
    );
  }

  async waitForNomieeDetailsTabAndClickNext() {
    await expect(this.nomineeDetailsTab).toBeVisible();
    await this.nextButton.click();
    await this.page.waitForTimeout(1000);
    console.info(
      "Nominee Detail tab is visible and in focus > clicked next button",
    );
  }

  async waitForJewelleryDetailsTabAndClickNext() {
    await expect(this.jewelleryDetailsTab).toBeVisible();
    await this.nextButton.click();
    await this.page.waitForTimeout(1000);
    console.info(
      "Jewellery Detail tab is visible and in focus > clicked next button",
    );
  }

  async waitForFICDetailsTabAndClickNext() {
    await expect(this.FICDetailsTab).toBeVisible();
    await this.nextButton.click();
    await this.page.waitForTimeout(1000);
    console.info(
      "FIC Detail tab is visible and in focus > clicked next button",
    );
  }

  async waitForBankDetailsTabAndClickNext() {
    await expect(this.bankDetails).toBeVisible();
    await this.nextButton.click();
    await this.page.waitForTimeout(1000);
    console.info(
      "Bank Detail tab is visible and in focus > clicked next button",
    );
  }

  async waitForPacketDetailsTabAndClickNext() {
    await expect(this.packetDetailsTab).toBeVisible();
    await this.nextButton.click();
    await this.page.waitForTimeout(1000);
    console.info(
      "Packet Detail tab is visible and in focus > clicked next button",
    );
  }

  async waitForDocumentUploadTabAndClickNext() {
    await expect(this.documentUploadTab).toBeVisible();
    await this.nextButton.click();
    await this.page.waitForTimeout(1000);
    console.info(
      "Nominee Detail tab is visible and in focus > clicked next button",
    );
  }

  async waitForLoanApprovalTab() {
    await expect(this.loanStatusApproval).toBeVisible();
    console.info("Loan Status Detail tab is visible and in focus ");
    await this.page.waitForTimeout(1000);
  }

  async opsTeamApproval() {
    await expect(this.loanApplicationFormTick).toBeVisible();
    await this.loanApplicationFormTick.click();
    await this.page.waitForTimeout(1000);
    await expect(this.goldValuationFormTick).toBeVisible();
    await this.goldValuationFormTick.click();
    await this.page.waitForTimeout(1000);
    await this.opsTeamLoanStatus.selectOption({ value: "approved" });
    await this.page.waitForTimeout(1500);
    await this.submitButton.click();
    await this.page.waitForTimeout(3000);
    console.info(`Operation Team Loan Status is approved & Submitted the loan`);
  }
}
