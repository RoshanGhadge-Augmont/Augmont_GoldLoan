import { expect } from "@playwright/test";
import config from "../config/env";
import { uploadFile } from "../commonUtils/fileUploadHelperUtility";
import {
  readOutput,
  readInput,
  writeOutput,
  wr,
} from "../commonUtils/dataManagerUtility";

/** @typedef {import('@playwright/test').Page} Page */

export class UploadDocumentPage {
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
    this.uploadDocumentsButton = this.filterRow.locator(
      "//button[normalize-space()='UPLOAD DOCUMENTS']",
    );

    // Upload Documents page objects
    this.documentUploadTab = this.page
      .locator("div")
      .filter({ hasText: "Upload Documents" })
      .first();
    this.loanAgreementCopyDocument = this.page.locator(
      "(//input[@type='file'])[1]",
    );
    this.pawnTicketDocument = this.page.locator("(//input[@type='file'])[2]");
    this.schemeConfigurationCopyDocument = this.page.locator(
      "(//input[@type='file'])[3]",
    );
    this.downloadCashReceiptButton = this.page.getByText(
      "Download Cash Receipt",
    );
    this.uploadCashReceiptButton = this.page.locator(
      "(//input[@type='file'])[7]",
    );
    this.cashReceiptRequiredError = this.page.locator(
      "mat-error[role='alert'][id='mat-error-2']",
    );
    this.saveButton = this.page.getByText("Save");
    this.confirmationPopUp = this.page.getByText(
      "Is the OSV done for the customer?",
    );
    this.yesButton = this.page.getByRole("button", { name: "Yes" });

    // Lead Converter Popup
    this.leadConverterPopup = this.page.locator(
      'label:has-text("Lead Converter")',
    );
    this.selectLeadConverter = this.page.locator(
      'select[formcontrolname="leadConverterId"]',
    );
    this.doneButton = this.page.getByRole("button", { name: "Done" });
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
    console.info("For Appraiser -> Show all branches is selected");
  }

  async searchCustomerandClickUploadDocuments(customerId) {
    await this.searchCustomerField.fill(customerId);
    console.info(`Searched with the ${customerId} on applied loan page`);
    await this.page.waitForTimeout(2000);
    await this.filterButton.click();
    await this.page.waitForTimeout(2000);

    // Get the Loan Id for customer
    const loanId = await this.filterRow
      .locator("td")
      .filter({
        has: this.page.locator("span.ui-column-title", { hasText: "Loan ID" }),
      })
      .locator("div.ng-star-inserted")
      .first()
      .textContent();
    console.info(`Fetched the loan Id for customer ${loanId.trim()}`);
    await this.page.waitForTimeout(2000);
    writeOutput("addCustomerDetails", { loanId: loanId.trim() });

    await this.uploadDocumentsButton.click();
    await this.page.waitForTimeout(2000);
    console.info(`Filter > document upload button is clicked`);
  }
  async waitForUploadDocumentTab() {
    await this.documentUploadTab.waitFor({
      state: "visible",
      timeout: 10000,
    });
    await expect(this.documentUploadTab).toBeVisible();
    console.info("Document Upload Details tab is visible and in focus");
  }

  async uploadLoanDocuments() {
    await this.page.context().addInitScript(() => {
      window.print = () => {};
    });
    // await this.loanAgreementCopyDocument.setInputFiles(
    //   "test-data/Attachments/sample_pdf.pdf",
    //   { timeout: 7000 },
    // );
    await uploadFile(
      this.page,
      this.loanAgreementCopyDocument,
      "sample_pdf.pdf",
    );
    await this.page.waitForTimeout(2000);
    console.info("Loan Agreement copy gets uploaded");
    // await this.pawnTicketDocument.setInputFiles(
    //   "test-data/Attachments/sample_pdf.pdf",
    //   { timeout: 7000 },
    // );
    await uploadFile(this.page, this.pawnTicketDocument, "sample_pdf.pdf");
    console.info("pawn ticket copy gets uploaded");
    await this.page.waitForTimeout(2000);
    // await this.schemeConfigurationCopyDocument.setInputFiles(
    //   "test-data/Attachments/sample_pdf.pdf",
    //   { timeout: 7000 },
    // );
    await uploadFile(
      this.page,
      this.schemeConfigurationCopyDocument,
      "sample_pdf.pdf",
    );
    console.info("scheme configuration gets uploaded");
    await this.page.waitForTimeout(2000);

    // download cash receipt window print preview handling
    const context = this.page.context();
    const popupPromise = this.page
      .waitForEvent("page", { timeout: 6000 })
      .catch(() => null);

    await this.downloadCashReceiptButton.click();
    console.info(`Download Cash Receipt button is clicked `);

    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState("domcontentloaded", { timeout: 5000 });
      await popup.evaluate(() => {
        window.print = () => {};
      });
      await popup.waitForTimeout(1000);
      await popup.close();
      console.info("Window preview for print gets closed");
    } else {
      console.info("No popup is detected for cash receipt");
    }
    await this.page.waitForTimeout(2000);

    await uploadFile(this.page, this.uploadCashReceiptButton, "sample_pdf.pdf");

    console.info("Cash receipt gets uploaded");
    await this.page.waitForTimeout(2000);
    await this.saveButton.click();

    const isCashReceiptErrorVisible = await this.cashReceiptRequiredError
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    console.info(
      `Getting value of is cash receipt is attached ${isCashReceiptErrorVisible}`,
    );

    if (isCashReceiptErrorVisible) {
      console.info("Cash receipt validation appeared. Re-uploading document");

      await this.page.waitForTimeout(3000);

      await uploadFile(
        this.page,
        this.uploadCashReceiptButton,
        "sample_pdf.pdf",
      );
      await this.page.waitForTimeout(2000);
      await expect(this.cashReceiptRequiredError)
        .toHaveCount(0, {
          timeout: 5000,
        })
        .catch(() => {});
      await this.page.waitForTimeout(2000);
      await this.saveButton.click();
      console.info("Cash receipt reupload+save gets successful");
    }
    // await confirmationPopUp(this.page, this.confirmationPopUp, this.yesButton);
    try {
      await this.confirmationPopUp.waitFor({ state: "visible", timeout: 3000 });
      if (await this.confirmationPopUp.isVisible()) {
        console.info("Confirmation popup is visible");
        await this.page.waitForTimeout(2000);
        await this.yesButton.click();
        console.info("confirmation pop-up is visible & its clicked");
      } else {
        console.info("Confirmation pop-up is not asked");
      }
    } catch (err) {
      console.error("Error gets thrown in confirmation pop-up", err);
    }

    try {
      await this.leadConverterPopup.waitFor({
        state: "visible",
        timeout: 3000,
      });
      if (await this.leadConverterPopup.isVisible()) {
        await this.page.waitForTimeout(2000);
        console.info("Lead Converter is visible");
        await this.selectLeadConverter.selectOption({ value: "1388" });
        await this.page.waitForTimeout(2000);
        await this.doneButton.click();
        console.info("Lead Converter popup is visible and button is clicked");
      } else {
        console.info("Lead Converter popup is not getting shown");
      }
    } catch (err) {
      console.error("Error gets thrown in Lead converter pop-up", err);
    }
  }

  async waitForAppliedLoanPage() {
    await this.page.waitForURL("**/admin/loan-management/applied-loan", {
      timeout: 2000,
    });
    await this.page.waitForTimeout(2000);
    console.info("Navigated to the applied loan page");
  }
}
