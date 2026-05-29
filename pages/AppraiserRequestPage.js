import { expect } from "@playwright/test";
import { generateRandomMobileNumber } from "../commonUtils/randomDataUtility.js";
import {
  readInput,
  writeOutput,
  resetOutput,
  readOutput,
} from "../commonUtils/dataManagerUtility.js";
import { stat } from "node:fs";
import config from "../config/env.js";
import { ClickPicture } from "../commonUtils/cameraHandlingUtility.js";
import {
  cpvMandatoryPopup,
  savePacketPopup,
} from "../commonUtils/popUpHelperUtility.js";

/** @typedef {import('@playwright/test').Page} Page */

export class AppraiserRequestpage {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;

    // Branch selection from profile
    this.profileIcon = this.page.locator(".kt-header__topbar-user");
    this.branchSelectionDropDown = this.page.locator(".profile-name select");

    // Appraiser request page elements
    this.searchField = this.page.getByPlaceholder("enter text here");
    this.applyLoanButton = this.page.getByRole("menuitem", {
      name: "Apply Loan",
    });

    // Loan Request cpv mandatory popup
    this.cpvManadatorPopUp = this.page.getByText(
      "CPV would be mandatory for loans above 5 lakh.",
      { exact: true },
    );
    this.popUpOkButton = this.page.getByText("Ok", { exact: true });

    // New Loan > Basic Details Page
    this.basicDetailsTab = this.page.getByText("Basic Details", {
      exact: true,
    });
    this.loanPurpose = this.page.locator('select[formcontrolname="purpose"]');
    this.nextButton = this.page.getByRole("button", { name: "Next" });

    // New Loan > Nominee Details page
    this.nomineeDetailsTab = this.page.getByText("Nominee Details", {
      exact: true,
    });
    this.nomineeNameField = this.page.locator(
      'input[formcontrolname="nomineeName"]',
    );
    this.nomineeRelationshipField = this.page.locator(
      'select[formcontrolname="relationship"]',
    );
    this.nomineeAgeField = this.page.locator(
      'input[formcontrolname="nomineeAge"]',
    );
    this.nomineeMobileNumberField = this.page.locator(
      'input[formcontrolname="mobileNumber"]',
    );

    // New Loan > Jewellery Details Tab
    this.jewelleryDetailsTab = this.page.locator(
      '(//div[@tabindex="0" and @role="tab"])[1]',
    );

    this.jewellery1 = this.page.locator('span:has-text("Jewellery 1")');
    this.jewelleryTypeInputField = this.page.locator(
      'div.ng-input input[role="combobox"]',
    );

    this.grossWeightField = this.page.locator(
      'input[formcontrolname="grossWeight"]',
    );
    this.numberOfPiecesField = this.page.locator(
      'input[formcontrolname="quantity"]',
    );
    this.deductionWeightField = this.page.locator(
      'input[formcontrolname="deductionWeight"]',
    );
    this.netWeightField = this.page.locator(
      'input[formcontrolname="netWeight"]',
    );
    this.karatDropdown = this.page.locator('select[formcontrolname="karat"]');
    this.purityDropdown = this.page.locator(
      'select[formcontrolname="ltvPercent"]',
    );
    this.remarkField = this.page.locator('input[formcontrolname="remark"]');
    this.uploadJewelleryWithWightImage = this.page.locator("div.img-container");
    this.cameraPreview = this.page.locator("div.webcam-wrapper");
    this.takePicture = this.page.locator('div[title="Take Picture"]');

    // Add More JewelleryButton
    this.addMoreJewellery = this.page.getByRole("button", {
      name: "+ Add More",
    });
    this.jewellery2 = this.page.locator('span:has-text("Jewellery 2")');
    this.selectStudsJewellery = this.page.locator(
      'span.ng-option-label:has-text("Studs")',
    );

    // Final Interest Calculation Section
    this.FICPageTab = this.page
      .locator("div")
      .filter({ hasText: "Final Interest Calculator" })
      .first();
    this.partnerName = this.page.locator('select[formcontrolname="partnerId"]');
    this.colenderPartnerName = this.page.locator(
      'select[formcontrolname="coLenderBankId"]',
    );
    this.schemeName = this.page.locator('select[formcontrolname="schemeId"]');
    this.loanAmountField = this.page.locator(
      'input[formcontrolname="finalLoanAmount"]',
    );
    this.loanTenureField = this.page.getByText("Tenure", { exact: true });
    this.calculateButton = this.page.getByRole("button", { name: "Calculate" });

    // Bank Details Page
    this.bankDetailsTab = this.page
      .locator("div")
      .filter({ hasText: "Bank Details" })
      .first();

    this.branchAdvanceCash = this.page.locator(
      'input[formcontrolname="advanceCash"]',
    );

    // Packet Submission Tab
    this.packetDetailsTab = this.page
      .locator("div")
      .filter({ hasText: "Packets" })
      .first();
    this.selectPacketDropdown = this.page.locator(
      'select[formcontrolname="packetId"]',
    );
    this.jewelleryTypeField = this.page.locator(
      "div.ng-select-container div.ng-input input[role='combobox']",
    );
    this.selectAllJewelleryOption = this.page.locator(
      "div.ng-dropdown-header label.ng-star-inserted span.label-checkbox",
    );
    this.addJewelleryButton = this.page
      .locator("span")
      .filter({ hasText: "Add" });

    // packet Images
    this.emptyPacketWithJewellery = this.page.locator('img[name="packet1"]');
    this.sealedPacketWithWeight = this.page.locator('img[name="packet2"]');
    this.sealedPackets = this.page.locator('(//img[@name="packet3"])[1]');
    this.customerLiveImage = this.page.locator('(//img[@name="packet3"])[2]');
    this.saveButton = this.page.locator("span").filter({ hasText: "Save" });
    this.savePacketPopUp = this.page.getByText(
      " Are you sure, you want to save packets?",
      { exact: true },
    );
    this.savePacketYesButton = this.page.getByText("Yes", { exact: true });
  }

  async navigateTOAppraiserRequest() {
    await this.page.goto(
      config.BASEURL + "/admin/lead-management/new-requests",
      { waitUntil: "load" },
    );
    console.info("Navigated to the Appraiser Request Page");
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

  async searchCustomerIdandApplyLoan(customerID) {
    await this.searchField.fill(customerID.trim());
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(2000);

    this.filterRow = this.page.locator("//mat-row[@role='row']").first();
    this.checkStatus = this.page.locator(
      "(//mat-row[@role='row']/mat-cell)[10]",
    );
    this.moreOptionButton = this.filterRow.getByText("more_vert", {
      exact: true,
    });
    const statusOfRequest = this.checkStatus.innerText();
    await this.moreOptionButton.click();
    await expect(this.applyLoanButton).toBeVisible();
    await this.applyLoanButton.click();

    // Handling CPV mandatory Popup
    await cpvMandatoryPopup(
      this.page,
      this.cpvManadatorPopUp,
      this.popUpOkButton,
    );
  }

  async fillLoanBasicDetails(loanType) {
    await this.basicDetailsTab.waitFor({
      state: "visible",
      timeout: 10000,
    });
    await expect(this.basicDetailsTab).toBeVisible();
    await this.loanPurpose.selectOption({ label: loanType });
    await this.nextButton.click();
    console.info("Basic details has been entered successfully");
  }
  async waitForNomineeDetailsTab() {
    await expect(this.nomineeDetailsTab).toBeVisible();
    await this.page.waitForTimeout(1000);
    console.info("Nominee details tab is visible completely");
  }

  async fillLoanNomineeDetails(nomineeName, nomineeRelation, nomineeAge) {
    const nomineeMobileNumberToSend = generateRandomMobileNumber();
    await this.nomineeNameField.fill(nomineeName);
    await this.page.waitForTimeout(1500);
    await this.nomineeRelationshipField.selectOption({
      label: nomineeRelation,
    });
    await this.page.waitForTimeout(1500);
    await this.nomineeAgeField.fill(nomineeAge);
    await this.page.waitForTimeout(1500);
    await this.nomineeMobileNumberField.fill(nomineeMobileNumberToSend);
    await this.page.waitForTimeout(1500);
    console.info(
      `Nominee mobile number has been entered as ${nomineeMobileNumberToSend}`,
    );
    writeOutput("addCustomerDetails", {
      nomineeMobileNumber: nomineeMobileNumberToSend,
    });

    console.info("All the nominee details are filled up ");
    await this.nextButton.click();
  }

  async waitForJewelleryDetailsTab() {
    await expect(this.jewelleryDetailsTab).toBeVisible();
    await this.page.waitForTimeout(1000);
    console.info("Jewellery details tab is visible and in focus");
  }

  async fillLoanJewelleryDetailsTab(
    ornament1,
    ornament1Pieces,
    ornament1GrossWeight,
    ornament1DeductionWeight,
    ornament1Karat,
    ornament1Purity,
    ornament2,
    ornament2Pieces,
    ornament2GrossWeight,
    ornament2DeductionWeight,
    ornament2Karat,
    ornament2Purity,
  ) {
    // Adding Jewellery 1 Details
    await expect(this.jewellery1).toBeVisible();
    console.info("Jewellery 1 section is visible");
    await this.jewelleryTypeInputField.click();
    await this.page.waitForTimeout(1500);
    await this.jewelleryTypeInputField.fill(ornament1);
    await this.page.waitForTimeout(1500);
    this.selectOrnament1Jewellery = this.page.locator(
      `span.ng-option-label:has-text("${ornament1}")`,
    );
    await this.page.waitForTimeout(1500);
    await expect(this.selectOrnament1Jewellery).toBeVisible();
    await this.selectOrnament1Jewellery.click();
    await this.page.waitForTimeout(1500);
    console.info("Jewellery Type as the chain is selected");
    await this.numberOfPiecesField.fill(ornament1Pieces);
    await this.page.waitForTimeout(1500);
    await this.grossWeightField.fill(ornament1GrossWeight);
    await this.page.waitForTimeout(1500);
    await this.deductionWeightField.fill(ornament1DeductionWeight);
    await this.page.waitForTimeout(1500);
    await this.netWeightField.click();
    console.info(
      "Jewellery 1 Details- number of pieces, gross, deduction weight is updated",
    );
    await this.karatDropdown.selectOption({ label: ornament1Karat });
    await this.page.waitForTimeout(1500);
    await this.purityDropdown.selectOption({ label: ornament1Purity });
    await this.page.waitForTimeout(1500);
    await this.remarkField.fill("Test 1 Remark is added");
    await this.uploadJewelleryWithWightImage.click();
    await this.page.waitForTimeout(1500);
    await ClickPicture(this.page, this.cameraPreview, this.takePicture);

    console.info(
      "Jewellery picture with its weight has been taken for jewellery 1 ",
    );

    // Adding Jewellery 2 Details
    await this.addMoreJewellery.click();
    await this.page.waitForTimeout(2000);
    await expect(this.jewellery2).toBeVisible();
    console.info(
      "Jewellery 2 section is visible after clicking on add more jewellery button",
    );
    await this.page.waitForTimeout(1500);
    await this.jewelleryTypeInputField.click();
    await this.page.waitForTimeout(1500);
    await this.jewelleryTypeInputField.fill(ornament2);
    await this.page.waitForTimeout(1500);
    this.selectOrnament2Jewellery = this.page.locator(
      `span.ng-option-label:has-text("${ornament2}")`,
    );
    await this.page.waitForTimeout(1500);
    await expect(this.selectOrnament2Jewellery).toBeVisible();
    await this.selectOrnament2Jewellery.click();
    await this.page.waitForTimeout(1500);
    console.info("Jewellery Type as the chain is selected");
    await this.numberOfPiecesField.fill(ornament2Pieces);
    await this.page.waitForTimeout(1500);
    await this.grossWeightField.fill(ornament2GrossWeight);
    await this.page.waitForTimeout(1500);
    await this.deductionWeightField.fill(ornament2DeductionWeight);
    await this.page.waitForTimeout(1500);
    await this.netWeightField.click();

    console.info(
      "Jewellery 2 Details- number of pieces, gross, deduction weight is updated",
    );
    await this.karatDropdown.selectOption({ label: ornament2Karat });
    await this.purityDropdown.selectOption({ label: ornament2Purity });
    await this.remarkField.fill("Test 2 Remark is added");
    await this.uploadJewelleryWithWightImage.click();
    await ClickPicture(this.page, this.cameraPreview, this.takePicture);

    console.info(
      "Jewellery picture with its weight has been taken for jewellery 2 ",
    );

    await expect(this.nextButton).toBeVisible();
    await this.nextButton.click();
    await this.page.waitForTimeout(2000);
  }

  async waitForFICDetailsTab() {
    await expect(this.FICPageTab).toBeVisible();
    await this.page.waitForTimeout(2000);
    console.info("Final Interest calculation tab is visible and in focus");
  }

  async fillLoanFICDetailsTab(partner, loanAmount, schemeName) {
    await this.partnerName.selectOption({ label: partner });
    await this.colenderPartnerName.selectOption({ label: "None" });
    await this.schemeName.selectOption({ label: schemeName });
    await this.loanAmountField.fill(loanAmount);
    await this.loanTenureField.click();
    await this.page.waitForTimeout(2000);
    await expect(this.calculateButton).toBeVisible();
    await this.calculateButton.click();
    await this.page.waitForTimeout(2000);
    console.info(
      "All the loan details are filled and clicked on calculate button",
    );
    await this.nextButton.click();
  }

  async waitForBankDetailsTab() {
    await expect(this.bankDetailsTab).toBeVisible();
    await this.page.waitForTimeout(1000);
    console.info("Bank Details tab is visible and in focus");
  }

  async fillLoanBankDetails() {
    await this.branchAdvanceCash.clear();
    await this.page.reload({ waitUntil: "networkidle" });
    await this.branchAdvanceCash.clear();

    // More robust locator: find the row by label text instead of hardcoded row number
    let toBePaidAmount = null;

    try {
      // Try to find "Amount to be Paid" or similar label text in the table
      const amountRow = await this.page
        .locator(
          "//tbody/tr[contains(., 'To be Paid') or contains(., 'be paid')]",
        )
        .first();

      const rowText = await amountRow.innerText();
      console.info(`Found amount row: ${rowText}`);

      // Extract the amount directly from the row text
      // The row text contains something like "To be paid    ₹10,000"
      // Extract just the numeric amount with currency
      const currencyMatch = rowText.match(/₹[\d,]+/);
      if (currencyMatch) {
        toBePaidAmount = currencyMatch[0].replace(/[₹,\s]/g, "").trim();
      } else {
        // Fallback: try to extract any sequence of digits and commas
        const digitMatch = rowText.match(/[\d,]+/);
        if (digitMatch) {
          toBePaidAmount = digitMatch[0].replace(/,/g, "").trim();
        }
      }
      console.info(`Extracted amount: ${toBePaidAmount}`);
    } catch (error) {
      console.warn(
        `Failed to find by label, trying fallback method: ${error.message}`,
      );

      // Fallback: try the hardcoded xpath as backup
      try {
        const rawText = await this.page
          .locator("//tbody/tr[8]/td[2]")
          .innerText();
        toBePaidAmount = rawText.replace(/[₹,\s]/g, "").trim();
      } catch (fallbackError) {
        console.error(`Fallback method also failed: ${fallbackError.message}`);
        // Alternative: try to get all tbody rows and log them for debugging
        const allRows = await this.page.locator("//tbody/tr").count();
        console.info(`Total rows in table: ${allRows}`);

        // Try to find any row that contains currency symbol or numbers
        for (let i = 0; i < Math.min(allRows, 15); i++) {
          const cellText = await this.page
            .locator(`//tbody/tr[${i + 1}]/td[2]`)
            .innerText()
            .catch(() => "");
          console.info(`Row ${i + 1}, Column 2: ${cellText}`);
        }
      }
    }

    if (toBePaidAmount && toBePaidAmount.length > 0) {
      console.info(`Amount to be paid is fetched: ${toBePaidAmount}`);
      await this.branchAdvanceCash.fill(toBePaidAmount);
      console.info(
        "Amount to be paid is entered into the advance cash section",
      );
    } else {
      throw new Error(
        "Failed to fetch amount to be paid - cannot proceed with test",
      );
    }
    await this.page.waitForTimeout(1500);
    await this.nextButton.click();
  }

  async waitForPacketDetailsTab() {
    await this.page.waitForTimeout(2000);
    await expect(this.packetDetailsTab).toBeVisible();
    console.info("Packet Details tab is visible and in focus");
  }

  async fillLoanPacketDetails() {
    await this.selectPacketDropdown.selectOption({ index: 1 });
    await this.page.waitForTimeout(1500);
    await this.jewelleryTypeField.click();
    await this.page.waitForTimeout(1500);
    await this.jewelleryTypeField.fill("Select All");
    await this.page.waitForTimeout(1500);
    await expect(this.selectAllJewelleryOption).toBeVisible();
    await this.selectAllJewelleryOption.click();
    await this.addJewelleryButton.click();
    // Taking picture of empty packet with all jewellery
    await this.emptyPacketWithJewellery.click();

    // Camera Condition Handling
    await ClickPicture(this.page, this.cameraPreview, this.takePicture);

    // await this.cameraPreview.waitFor({
    //   state: "visible",
    //   timeout: 5000,
    // });

    // await expect(this.takePicture).toBeVisible();
    // await this.page.waitForTimeout(1500);
    // await this.takePicture.click();
    // await this.page.waitForTimeout(1500);
    // await this.cameraPreview.waitFor({ state: "hidden", timeout: 5000 });
    console.info("Empty Packet with all jewellery picture has been taken ");

    // Taking picture of sealed packet with weight
    await this.page.waitForTimeout(1500);
    await this.sealedPacketWithWeight.click();
    await this.page.waitForTimeout(1500);
    await ClickPicture(this.page, this.cameraPreview, this.takePicture);

    // await this.cameraPreview.waitFor({
    //   state: "visible",
    //   timeout: 5000,
    // });
    // await expect(this.takePicture).toBeVisible();
    // await this.takePicture.click();
    // await this.page.waitForTimeout(1500);
    // await this.cameraPreview.waitFor({ state: "hidden", timeout: 5000 });
    console.info(
      "Sealed packet with weight jewellery picture has been taken for ",
    );

    // Sealed packet
    await this.page.waitForTimeout(1500);
    await this.sealedPackets.click();
    await this.page.waitForTimeout(1500);
    await ClickPicture(this.page, this.cameraPreview, this.takePicture);

    // await this.cameraPreview.waitFor({
    //   state: "visible",
    //   timeout: 5000,
    // });
    // await expect(this.takePicture).toBeVisible();
    // await this.page.waitForTimeout(1500);
    // await this.takePicture.click();
    // await this.page.waitForTimeout(1500);
    // await this.cameraPreview.waitFor({ state: "hidden", timeout: 5000 });
    console.info("Sealed packet  picture has been taken for  ");

    // Customer Live Image
    await this.page.waitForTimeout(1500);
    await this.customerLiveImage.click();
    await this.page.waitForTimeout(1500);
    await ClickPicture(this.page, this.cameraPreview, this.takePicture);

    // await this.cameraPreview.waitFor({
    //   state: "visible",
    //   timeout: 5000,
    // });
    // await this.page.waitForTimeout(1500);
    // await expect(this.takePicture).toBeVisible();
    // await this.takePicture.click();
    // await this.page.waitForTimeout(1500);
    // await this.cameraPreview.waitFor({ state: "hidden", timeout: 5000 });
    console.info("Customer Live image has been taken for");

    // Saving all the details
    await expect(this.saveButton).toBeVisible();
    await this.saveButton.click();
    await savePacketPopup(
      this.page,
      this.savePacketPopUp,
      this.savePacketYesButton,
    );
    console.info(`All the packet details are saved successfullly`);

    // try {
    //   await this.page.waitForTimeout(1500);
    //   await this.page.waitForTimeout(1500);
    //   await this.savePacketPopUp.waitFor({ state: "visible", timeout: 3000 });
    //   await this.page.waitForTimeout(1500);
    //   if (await this.savePacketPopUp.isVisible()) {
    //     await this.page.waitForTimeout(1500);
    //     await this.savePacketYesButton.click();
    //     await this.page.waitForTimeout(2000);
    //     console.info(
    //       " Are you sure, you want to save packets? is asked and clicked on yes button",
    //     );
    //   } else {
    //     console.info(" Are you sure, you want to save packets? is not asked");
    //   }
    // } catch (err) {
    //   console.error("Error gets thrown in Save Packet PopUp", err);
    // }
  }
}
