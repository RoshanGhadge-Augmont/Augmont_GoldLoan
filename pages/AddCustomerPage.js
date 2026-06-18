import { generateRandomMobileNumber } from "../commonUtils/randomDataUtility.js";
import { test, expect } from "@playwright/test";
import {
  readInput,
  writeOutput,
  resetOutput,
  readOutput,
} from "../commonUtils/dataManagerUtility.js";
import config from "../config/env.js";
import { logger } from "../commonUtils/loggerHelperUtility.js";
import { getCaseInsensitiveOptionLabel } from "../commonUtils/dropdownOptionMatcherUtility.js";

/** @typedef {import('@playwright/test').Page} Page */
export class AddCustomerPage {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;

    // Branch selection from profile
    this.profileIcon = page.locator(".kt-header__topbar-user");
    this.branchSelectionDropDown = page.locator(".profile-name select");
    this.customerManagementMenu = page
      .locator(".kt-menu__link-text")
      .filter({ hasText: "Customer Management" });

    this.allCustomersOption = page
      .locator(".kt-menu__subnav")
      .getByText("All Customers", { exact: true });

    // Add Customer Button & Popup all elements
    this.allCustomerPage = page.getByText("All Customers");
    this.addCustomerButton = page.getByText("Add Customer");
    this.addCustomerPopUp = page.getByRole("heading", {
      name: "Add Customer",
    });
    this.leadSourceDropdown = page.locator(
      "select[formcontrolname='leadSource']",
    );
    this.firstNameField = page.getByPlaceholder("First Name", {
      exact: true,
    });
    this.lastNameField = page.getByPlaceholder("Last Name", { exact: true });
    this.mobileNumberField = page.getByPlaceholder("Enter mobile number", {
      exact: true,
    });
    this.sendOTPButton = page.getByText("Send Otp", { exact: true });
    this.enterOTPField = page.getByPlaceholder("Enter OTP", {
      exact: true,
    });
    this.verifyOTPButton = page.locator('span:has-text("Verify")');
    this.verifiedButton = page.locator('span:has-text("Verified")');
    this.stateDropdown = page.locator("select[formcontrolname='stateId']");
    this.cityDropdown = page.locator("select[formcontrolname='cityId']");
    this.pinCodeField = page.locator("input[formcontrolname='pinCode']");
    this.productDropdown = page.locator("select[formcontrolname='moduleId']");
    this.statusDropdown = page.locator("select[formcontrolname='statusId']");
    this.selectedStatus = this.statusDropdown.locator("option:checked");
    this.addButton = page.getByText("Add", { exact: true });
    this.cancelButton = page.getByText("Cancel", { exact: true });
  }

  // All action methods
  async changeDefaultBranch(branch) {
    console.info(`Started flow for changing the default branch`);
    await this.profileIcon.click();
    await this.branchSelectionDropDown.click();
    const branchLabel = await getCaseInsensitiveOptionLabel(
      this.branchSelectionDropDown,
      branch,
    );
    if (branchLabel) {
      console.info(
        `Branch label with case insensitive match is found as ${branchLabel}`,
      );
      await this.branchSelectionDropDown.selectOption({
        label: branchLabel,
      });
    } else {
      console.warn(`Branch label not found for ${branch}`);
    }
    console.info(`Completed Branch has been changed to ${branch}`);
  }

  async navigateToAddCustomerPage() {
    await this.page.goto(config.BASEURL + "/admin/lead-management", {
      waitUntil: "load",
    });
    console.info("Navigated to the Add Customer page");
  }

  async addNewCustomer(
    firstname,
    lastname,
    otp,
    pincode,
    leadConverter,
    state,
    city,
  ) {
    try {
      await this.addCustomerButton.click();
      console.info(`Started the flow of adding customer`);
      await expect(this.addCustomerPopUp).toBeVisible({ timeout: 6000 });
      const leadSourceLabel = await getCaseInsensitiveOptionLabel(
        this.leadSourceDropdown,
        leadConverter,
      );

      if (leadSourceLabel) {
        await this.leadSourceDropdown.selectOption({
          label: leadSourceLabel,
          timeout: 6000,
        });
        console.log(`Selected: "${leadSourceLabel}"`);
      } else {
        console.warn("leadSource option not found");
      }
      await this.firstNameField.fill(firstname);
      await this.lastNameField.fill(lastname);
      await expect(this.sendOTPButton).toBeDisabled({ timeout: 6000 });
      const mobileNumberToSend = generateRandomMobileNumber();
      await this.mobileNumberField.fill(mobileNumberToSend);
      console.info(`Mobile Number Entered Is :- ${mobileNumberToSend}`);
      // Saving User Details
      writeOutput("addCustomerDetails", {
        customerMobileNumber: mobileNumberToSend,
      });
      console.info(`Customer Id has been saved to addCustomerDetails`);
      await expect(this.sendOTPButton).toBeEnabled({ timeout: 6000 });
      await this.sendOTPButton.click();
      await expect(this.enterOTPField).toBeVisible({ timeout: 6000 });
      await this.enterOTPField.pressSequentially(otp, { delay: 400 });
      await expect(this.verifyOTPButton).toBeEnabled({ timeout: 6000 });
      await this.verifyOTPButton.click();
      console.info("Mobile Number is verified with OTP");
      await expect(this.verifiedButton).toBeVisible({ timeout: 6000 });
      const stateLabel = await getCaseInsensitiveOptionLabel(
        this.stateDropdown,
        state,
      );

      if (stateLabel) {
        await this.stateDropdown.selectOption({
          label: stateLabel,
          timeout: 6000,
        });
        console.log(`Selected: "${stateLabel}"`);
      } else {
        console.warn("State option not found");
      }

      const cityLabel = await getCaseInsensitiveOptionLabel(
        this.cityDropdown,
        city,
      );
      if (cityLabel) {
        await this.cityDropdown.selectOption({
          label: cityLabel,
          timeout: 6000,
        });
        console.log(`Selected: "${cityLabel}"`);
      } else {
        console.log("City option not found");
      }
      await expect(this.pinCodeField).toBeEnabled({ timeout: 6000 });
      await this.pinCodeField.fill(pincode);
      await expect(this.productDropdown).toBeEnabled({ timeout: 6000 });
      await this.productDropdown.selectOption({ label: "Gold Loan" });
      await expect(this.statusDropdown).toHaveValue("1");
      await expect(this.statusDropdown).toBeEnabled({ timeout: 6000 });
      await expect(this.selectedStatus).toHaveText("Confirm");
      await this.addButton.click();
      console.info(`Added a new customer to system`);
    } catch (err) {
      console.error("Exception is caught:- ", err);
      throw err;
    }
  }

  async fetchUserIdOfCustomer(pincode) {
    console.info(`Started flow of fetching UserId of customer from pincode`);
    await expect(this.addCustomerPopUp).not.toBeVisible({ timeout: 6000 });
    const customerRow = this.page
      .locator("tbody.ui-table-tbody > tr.ng-star-inserted")
      .filter({ hasText: pincode });
    console.info(`Searching the customer with its pincode : ${pincode}`);
    const customerIdCell = customerRow.locator("td span:nth-child(2)").first();
    await expect(customerIdCell).toBeVisible({ timeout: 6000 });
    const customerId = await customerIdCell.textContent();
    console.info("Newly Added Customer with it id:-", customerId.trim());
    writeOutput("addCustomerDetails", {
      customerId: customerId.trim(),
    });
    console.info(
      `Addded customer id for newly added customer into addCustomerDetails`,
    );
    return customerId;
  }

  async SearchCustomerInitiateKYCFlow(customerid) {
    // Filtering the customer with newly added customer id
    console.info(
      `Started the flow for searching the customer and initiating a kyc for customer`,
    );
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
    await expect(filteredRow).toBeVisible({ timeout: 6000 });
    console.info(`Filtered customer with customer id as ${customerId}`);
    await expect(applyKYCButton).toBeVisible({ timeout: 6000 });
    await applyKYCButton.click();
    console.info(`Apply KYC button is clicked > Navigating to the KYC Page`);
    await this.page.waitForLoadState("load");
  }
}
