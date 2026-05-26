import { expect } from "playwright/test";
import config from "../config/env";
import { generateTransactionId } from "../commonUtils/randomDataUtility.js";
import { confirmationOfPayment } from "../commonUtils/popUpHelperUtility.js";
import {
  readInput,
  writeOutput,
  resetOutput,
  readOutput,
} from "../commonUtils/dataManagerUtility.js";

/** @typedef {import('@playwright/test').Page} Page */

export class PartnerDisburseAmountPage {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;

    // Applied Loan page objects
    this.searchCustomerField = this.page.getByPlaceholder(
      "Enter Customer Unique Id",
    );
    this.filterButton = this.page.locator("button[type='submit']");
    this.filterRow = this.page.locator("tbody.ui-table-tbody tr:first-child");
    this.disburseAmountButton = this.filterRow.getByText("Disburse Amount  ", {
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
    this.disbursmentTab = this.page.getByText("Disbursement", { exact: true });

    // Next button
    this.nextButton = this.page.getByText("Next", { exact: true });

    // Loan Status Approval > Partner Logic
    this.loanApplicationFormTick = this.page.locator(
      "img[name='incorrectApplicationFormForOperatinalTeam']",
    );
    this.goldValuationFormTick = this.page.locator(
      "img[name='incorrectGoldValuationForOperatinalTeam']",
    );
    this.opsTeamLoanStatus = this.page.locator(
      'select[formcontrolname="loanStatusForPartner"]',
    );

    this.submitButton = this.page.getByText("Submit", { exact: true });

    // Amount Disbursement tab locators
    this.selectPaymentType = this.page.locator(
      "select[formcontrolname='bankTransferType']",
    );

    this.transactionIDField = this.page.locator(
      "input[formcontrolname='securedBankTransactionId']",
    );

    this.doneButton = this.page.getByText("Done", { exact: true });

    // Payment confirm disburse popup
    this.paymentDisbursePopup = this.page.getByText(
      /Are you sure you want to confirm the payment of INR/,
      { exact: false },
    );
    this.yesButton = this.page.getByRole("button", { name: "Yes" });
  }

  async navigateToAppliedLoan() {
    await this.page.goto(
      config.BASEURL + "/admin/loan-management/applied-loan",
      { waitUntil: "load" },
    );
    const currentURL = this.page.url();
    console.info(`After navigation, current URL: ${currentURL}`);

    if (!currentURL.includes("applied-loan")) {
      throw new Error(`Navigation failed. Redirected to: ${currentURL}`);
    }
  }

  async searchCustomerAndClickOnDisburseAmount(customerId) {
    await this.searchCustomerField.fill(customerId);
    console.info(`Searched with the ${customerId} on applied loan page`);
    await this.page.waitForTimeout(2000);
    await this.filterButton.click();
    await this.page.waitForTimeout(2000);
    await this.disburseAmountButton.waitFor({
      state: "visible",
      timeout: 10000,
    });
    // await this.opsRatingButton.scrollIntoViewIfNeeded();
    await this.disburseAmountButton.click({ force: true });
    console.info(`Filter > parner approval button is clicked`);
  }

  async waitForDisbursmentTabVisible() {
    await expect(this.disbursmentTab).toBeVisible();
  }

  async disburseAmount(paymentDisbursementType) {
    await this.page.waitForTimeout(2000);
    await this.selectPaymentType.selectOption({
      label: paymentDisbursementType,
    });
    console.info(
      `${paymentDisbursementType} Selected a transaction type from dropdown`,
    );
    let transactionIDGenerated = generateTransactionId();
    console.info(`Generated New transaction id ${transactionIDGenerated}`);
    await this.transactionIDField.fill(transactionIDGenerated);
    // Saving Transaction Details id
    writeOutput("addCustomerDetails", {
      disbursedPaymentTransactionId: transactionIDGenerated,
    });

    await this.doneButton.click();
    console.info(`Done button has been clicked`);

    await confirmationOfPayment(
      this.page,
      this.paymentDisbursePopup,
      this.yesButton,
    );
    console.info(`Amount gets disbusrsed completely`);
  }
}
