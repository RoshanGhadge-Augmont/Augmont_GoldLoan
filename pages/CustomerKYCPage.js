import { test, expect } from "@playwright/test";
import path from "path";
import {
  generateRandomPAN,
  generateRandomAadharNumber,
  generateRandomVoterIdNumber,
} from "../commonUtils/randomDataUtility.js";
import {
  readInput,
  writeOutput,
  resetOutput,
  readOutput,
} from "../commonUtils/dataManagerUtility.js";
import config from "../config/env.js";
import { uploadFile } from "../commonUtils/fileUploadHelperUtility.js";
import { ClickPicture } from "../commonUtils/cameraHandlingUtility.js";
import { OSVDoneForCustomerPopup } from "../commonUtils/popUpHelperUtility.js";
import { getCaseInsensitiveOptionLabel } from "../commonUtils/dropdownOptionMatcherUtility.js";

/** @typedef {import('@playwright/test').Page} Page */

export class CustomerKYCPage {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;
    this.customerID;

    // commonly used locators
    this.pageSubHeading = this.page.locator('label:has-text("Customer KYC")');
    this.kycFlowManual = this.page.getByText("Manual", { exact: true });
    this.confirmationPopUp = this.page.getByText(
      "Is the OSV done for the customer?",
    );
    this.yesButton = this.page.getByRole("button", {
      name: "Yes",
    });
    this.allowButton = this.page.getByRole("button", { name: "Allow" });

    // Step 1 > Basic Details Locators
    this.basicDetailsTab = this.page.locator('p:has-text("Basic Details")');
    this.kycDocumentTypeDropdown = this.page.locator(
      "select[formcontrolname='panType']",
    );
    this.kycAttachedFile = this.page.locator(
      'input[type="file"][accept="image/*,application/pdf"]',
    );
    this.kycPanCardNumber = this.page.getByPlaceholder("PAN");
    this.kycNextButton = this.page.getByText("Next", { exact: true });

    // Step 2 Address & Identity Locators
    this.locationPermissionOkButton = this.page.getByRole("button", {
      name: "Allow",
    });

    this.addressAndIdentityTab = this.page.locator(
      ':text-is("Address & Identity")',
    );
    this.attachAadharCardKYC = this.page.locator('(//input[@type="file"])[1]');
    this.aadharCardNumberField = this.page.locator(
      'div.input-group>input[maxlength="12"]',
    );
    this.keepResidentialandPermanentAddressSame =
      this.page.locator("span.checkmark");

    this.addressProofDropdown = this.page
      .locator('select[formcontrolname="addressProofTypeId"]')
      .first();

    this.voterIdCardNumberField = this.page.locator(
      '(//input[@formcontrolname="addressProofNumber"])[1]',
    );

    this.permanantAddressField = this.page.locator(
      '(//textarea[@id="permanent-address"])[1]',
    );

    this.stateDropdown = this.page.locator(
      '(//select[@formcontrolname="stateId"])[1]',
    );

    this.cityDropdown = this.page.locator(
      '(//select[@formcontrolname="cityId"])[1]',
    );

    this.landMarkField = this.page.locator(
      '(//input[@id="permanent-landmark"])[1]',
    );

    this.pinCodeField = this.page.locator(
      '(//input[@formcontrolname="pinCode"])[1]',
    );

    this.addressAndIdentifyNextButton = this.page.getByRole("button", {
      name: "Next",
    });

    // Personal Details Tab
    this.personalDetailsTab = this.page.locator(':text-is("Personal Details")');

    this.uploadProfilePictureButton = this.page.getByText(
      "Upload Profile Picture",
      { exact: true },
    );

    // calender control handling > under personal info
    this.calenderField = this.page.getByPlaceholder("DD/MM/YYYY");
    this.chooseYearandMonth = this.page.getByLabel("Choose month and year");
    this.selectYear = this.page.getByText("2003", { exact: true });
    this.month = this.page.getByText("NOV", { exact: true });
    this.date = this.page.locator(`//tr[td[normalize-space()='NOV']]//div`);

    // Camera Controls
    this.cameraPreview = this.page.locator("div.webcam-wrapper");

    this.takePictureButton = this.page.locator('div[title="Take Picture"] img');

    this.selectOccupationInput = this.page.locator(
      'ng-select[formcontrolname="occupationId"] input[role="combobox"]',
    );
    this.artisanOccupation = this.page.locator(
      '.ng-option span:text-is("Artisan/Craftsman")',
    );

    this.motherNameField = this.page.locator(
      'input[formcontrolname="motherName"]',
    );
    this.fatherNameField = this.page.locator(
      'input[formcontrolname="spouseName"]',
    );

    this.physicallyChallengedDropdown = this.page.locator(
      'select[placeholder="Physically Challenged"]',
    );

    this.religionDropdown = this.page.locator(
      'select[formcontrolname="religionId"]',
    );
    this.politicallyExposedDropdown = this.page.locator(
      'select[formcontrolname="politicalExposedId"]',
    );
    this.specialCategoryDropdown = this.page.locator(
      'select[formcontrolname="specialCategoryId"]',
    );
    this.annualIncomeDropdown = this.page.locator(
      'select[formcontrolname="annualIncome"]',
    );
    this.qualificationDropdown = this.page.locator(
      'select[formcontrolname="qualificationId"]',
    );
    this.signatureAttachmentOption = this.page.locator(
      '(//input[@type="file"])[2]',
    );
    this.personalDetailsPageNextButton = this.page.getByText("Next", {
      exact: true,
    });

    // Review & Submit Step 4
    this.reviewandSubmitTab = this.page.locator(
      'p:has-text("Review & Submit")',
    );

    this.reviewandSubmitButton = this.page.locator(
      'span:has-text("Review & Submit")',
    );

    // Applied KYC Page
    this.row = this.page
      .locator("//tbody/tr")
      .filter({ hasText: this.customerID });

    this.actionButton = this.row
      .locator("strong")
      .filter({ hasText: "Action >" })
      .first();

    this.customerClassificationTab = this.page.locator(
      'p:has-text("Customer Classification")',
    );

    this.operationTeamKYCDropdown = this.page.locator(
      'select[formcontrolname="kycStatusFromOperationalTeam"]',
    );

    this.submitButtonCustomerClassificationTab = this.page.locator(
      'span:has-text("Submit")',
    );
  }

  // All Action Methods

  async navigateToAllCustomerPage() {
    await this.page.goto(config.BASEURL + "/admin/lead-management", {
      waitUntil: "load",
    });
  }

  async dismissLocationPopupIfVisible() {
    try {
      await this.locationPermissionOkButton.waitFor({
        state: "visible",
        timeout: 3000,
      });
      if (await this.locationPermissionOkButton.isVisible()) {
        await this.locationPermissionOkButton.click();
        console.info("Location permission popup dismissed");
      }
    } catch {
      console.info("No location permission popup appeared");
    }
  }

  async getcustomerDetails(customerId) {
    this.customerID = customerId.trim();
    console.info("Customer Id :-", this.customerID);
  }

  async SearchCustomerInitiateKYCFlow(customerid) {
    // Filtering the customer with newly added customer id
    const customerId = customerid.trim();
    const customerIdSearchField = this.page.getByPlaceholder(
      "Enter Customer Unique Id",
    );
    const filterButton = this.page.getByText("Filter");
    const filteredRow = this.page
      .locator("tbody.ui-table-tbody > tr.ng-star-inserted")
      .filter({ hasText: customerId.trim() })
      .first();

    const applyKYCButton = filteredRow.getByRole("button", {
      name: "Apply KYC",
    });
    console.info(`searching the customer with its id :- ${customerId}`);
    await customerIdSearchField.fill(customerId.trim());
    await filterButton.click();
    await this.page.waitForTimeout(2000);
    console.info(`Filtered customer with customer id as ${customerId}`);
    await expect(filteredRow).toBeVisible();
    await expect(applyKYCButton).toBeVisible();
    await applyKYCButton.click();
    console.info("Apply KYC button is clicked > Navigating to the KYC Page");
  }

  async waitForKYCBasicDetailsTab() {
    await this.page.waitForURL(/kyc/);
    // await expect(this.basicDetailsTab).toBeVisible();
    console.info("KYC Basic Detail Tab is visible");
  }

  async fillKYCBasicDetails() {
    const panCardNumber = generateRandomPAN();
    console.info(`Generated Random Pan Card Number is :- ${panCardNumber}`);
    // Saving customer pan card details file
    writeOutput("addCustomerDetails", { customerPanCardNumber: panCardNumber });
    await expect(this.basicDetailsTab).toBeVisible();
    await expect(this.pageSubHeading).toBeVisible();
    await this.kycFlowManual.click();
    await this.kycDocumentTypeDropdown.selectOption({ label: "PAN" });
    await uploadFile(this.page, this.kycAttachedFile, "panCard.jpg");
    console.info("Pan Card File Attached Successfully");
    await this.kycPanCardNumber.fill(panCardNumber);
    await this.page.waitForTimeout(2000);
    await expect(this.kycNextButton).toBeVisible();
    console.info("Customer KYC > Basic Details > Next button is clicked");
    await this.kycNextButton.click();
    await this.page.waitForTimeout(2000);
    // Handling confirmation Popup for OSV Done
    await OSVDoneForCustomerPopup(
      this.page,
      this.confirmationPopUp,
      this.yesButton,
    );
    console.info("KYC basic details tab confirmation popup is handled.");

    const permissionState = await this.page.evaluate(async () => {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state;
    });
    console.log("Geolocation permission:", permissionState);
  }

  async waitForKYCAddressAndIdentityTab() {
    // await this.page.waitForURL(/KYC/);
    await expect(this.addressAndIdentityTab).toBeVisible();
    console.info("KYC Address & Identity Tab is visible");
    const permissionState = await this.page.evaluate(async () => {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state;
    });
    console.log("Geolocation permission:", permissionState);
  }

  async fillAddressIdentity(state, city, permanantAddress, landMark) {
    const aadharNumberGenerated = generateRandomAadharNumber();
    await this.kycFlowManual.click();
    console.info("KYC Manual flow button is clicked");
    const permissionState = await this.page.evaluate(async () => {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state;
    });

    console.log("Geolocation permission:", permissionState);

    await uploadFile(this.page, this.attachAadharCardKYC, "aadharCard.jpg");

    await this.aadharCardNumberField.click();
    await this.aadharCardNumberField.pressSequentially(aadharNumberGenerated, {
      delay: 500,
    });
    console.info(
      "Generated aadhar number & filled successfully into field:- ",
      aadharNumberGenerated.trim(),
    );
    writeOutput("addCustomerDetails", {
      customerAadhdarNumber: aadharNumberGenerated,
    });

    await this.keepResidentialandPermanentAddressSame.click();
    await this.addressProofDropdown.selectOption({ value: "2" });
    await this.page.waitForTimeout(1500);
    await this.permanantAddressField.fill(permanantAddress);
    await this.page.waitForTimeout(1500);
    const matchedStateLabel = await getCaseInsensitiveOptionLabel(
      this.stateDropdown,
      state,
    );
    if (matchedStateLabel) {
      await this.stateDropdown.selectOption({ label: matchedStateLabel });
    } else {
      console.warn(
        `State option ${state} is not found in the dropdown options`,
      );
    }
    await this.page.waitForTimeout(1500);
    const matchedCityLabel = await getCaseInsensitiveOptionLabel(
      this.cityDropdown,
      city,
    );
    if (matchedCityLabel) {
      await this.cityDropdown.selectOption({ label: matchedCityLabel });
    } else {
      console.warn(`City option ${city} is not found in the dropdown options`);
    }
    await this.page.waitForTimeout(1500);
    await this.landMarkField.fill(landMark);
    await this.page.waitForTimeout(1500);
    const enteredPinCode = await this.pinCodeField.inputValue();
    if (!enteredPinCode.trim()) {
      await this.pinCodeField.pressSequentially("400706", { delay: 100 });
      console.info(
        `Pincode was not already entered so we entered pincode into field`,
      );
    }

    await expect(this.addressAndIdentifyNextButton).toBeVisible();
    console.info(
      "Customer KYC > Address and Identity Details > Next button is visible",
    );
    await this.addressAndIdentifyNextButton.click();
    await this.page.waitForTimeout(2000);
    await OSVDoneForCustomerPopup(
      this.page,
      this.confirmationPopUp,
      this.yesButton,
    );
    console.info(
      "Address and Identity details tab confirmation popup is handled.",
    );
  }

  async waitForPersonalDetailsTab() {
    await expect(this.personalDetailsTab).toBeVisible();
    console.info("Now Personal Details Tab is Visible");
  }

  async fillPersonalDetails(
    motherName,
    fatherName,
    gender,
    maritalStatus,
    religion,
  ) {
    await this.uploadProfilePictureButton.click();
    await this.page.waitForTimeout(3000);
    await ClickPicture(this.page, this.cameraPreview, this.takePictureButton);
    console.info("Profile Picture is taken");
    await this.calenderField.click();
    await this.page.waitForTimeout(1000);
    await this.chooseYearandMonth.click();
    await this.page.waitForTimeout(1000);
    await this.selectYear.click();
    await this.page.waitForTimeout(1000);
    await this.month.click();
    await this.page.waitForTimeout(1000);
    await this.date.click();
    await this.page.waitForTimeout(1000);

    this.maleRadioButton = this.page.getByText(gender, { exact: true });

    this.maritalStatusButton = this.page.getByText(maritalStatus, {
      exact: true,
    });
    await this.maleRadioButton.click();
    await this.maritalStatusButton.click();
    await this.selectOccupationInput.click();
    await this.selectOccupationInput.fill("Artisan");
    await this.page.waitForTimeout(500);
    await expect(this.artisanOccupation).toBeVisible();
    await this.artisanOccupation.click();
    console.info("Occupation is selected from the dropdown");
    await this.page.waitForTimeout(1000);
    await this.motherNameField.fill(motherName);
    const religionLabel = await getCaseInsensitiveOptionLabel(
      this.religionDropdown,
      religion,
    );
    if (religionLabel) {
      await this.religionDropdown.selectOption({ label: religionLabel });
      console.info(
        `Religion label with case insensitive match is found as ${religionLabel}`,
      );
    } else {
      console.warn(`Religion label not found for ${religion}`);
    }
    await this.fatherNameField.fill(fatherName);
    await this.page.waitForTimeout(1000);
    await this.physicallyChallengedDropdown.selectOption({ value: "1" });
    await this.page.waitForTimeout(1000);
    console.log("");
    await this.politicallyExposedDropdown.selectOption({ value: "1" });
    console.log("Politically exposed dropdown value has been selected");
    await this.page.waitForTimeout(1000);
    await this.specialCategoryDropdown.selectOption({ value: "15" });
    console.log("Special Category is selected");
    await this.page.waitForTimeout(1000);
    await this.annualIncomeDropdown.selectOption({ value: "3 to 5 Lakh" });
    console.log("Annual Income selected");
    await this.page.waitForTimeout(1000);
    await this.qualificationDropdown.selectOption({ value: "5" });
    console.log("Qualification is selected");
    await this.page.waitForTimeout(1000);
    // await this.signatureAttachmentOption.setInputFiles(
    //   path.resolve("test-data/Attachments/signature.png"),
    // );
    await uploadFile(
      this.page,
      this.signatureAttachmentOption,
      "signature.png",
    );
    console.info("signature is attached");
    await this.personalDetailsPageNextButton.click();
    console.info("Next button is clicked");
  }

  async waitForReviewandSubmitDetailsTab() {
    await expect(this.reviewandSubmitTab).toBeVisible();
    console.info("Now Step4  Review and Submit Details Tab is visible");
  }

  async submitDetails() {
    await this.page.waitForTimeout(1000);
    await this.reviewandSubmitButton.click();
    console.info("Detals are reviewed and submitted");
  }

  async navigateToAppliedKYCPage() {
    await this.page.waitForURL("**/admin/applied-kyc", { timeout: 3000 });
    await this.page.waitForTimeout(1000);
    console.info("Navigated to the applied kyc page with edit");
  }

  async clickOnActionButton() {
    await this.actionButton.click();
    await this.page.waitForTimeout(1000);
    console.info(
      `Applied KYC > Action button is pressed for ${this.customerID}`,
    );
  }

  async validateKYCDetails() {
    await this.page.waitForURL("**/kyc-setting/edit-kyc**", { timeout: 3000 });
    await this.reviewandSubmitButton.click();
    await this.page.waitForTimeout(1500);
    console.info(
      "Validated all the details and clicked on review and submit button",
    );
  }

  async customerClassficationTabApproval() {
    await expect(this.customerClassificationTab).toBeVisible();
    const selectedOption = await this.page
      .locator("select[formcontrolname='kycStatusFromCce'] option:checked")
      .textContent();
    await expect(selectedOption.trim()).toBe("Approved");
    await this.page.waitForTimeout(2000);
    await this.operationTeamKYCDropdown.selectOption({ label: "Approved" });
    await this.page.waitForTimeout(1000);
    await this.submitButtonCustomerClassificationTab.click();
    await this.page.waitForTimeout(2000);
    console.info("Approved from the customer classification tab for KYC");
  }
}
