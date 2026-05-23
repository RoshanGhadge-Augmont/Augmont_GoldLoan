import { LoginPage } from "./loginpage";
import { AddCustomerPage } from "./AddCustomerPage";
import { CustomerKYCPage } from "./CustomerKYCPage";
import { InitiateGoldLoanPage } from "./InitiateGoldLoanPage";
import { AppraiserRequestpage } from "./AppraiserRequestPage";
import { UploadDocumentPage } from "./UploadDocumentPage";
import { OperationTeamApprovalPage } from "./OperationTeamApprovalPage";
import { PartnerDisburseAmountPage } from "./PartnerDisburseAmountPage.js";
import { SubmitPacketDetailsPage } from "./SubmitPacketDetailsPage.js";

/** @typedef {import('@playwright/test').Page} Page */
export class poManager {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;
  }

  //   For each required objects of pages will create a method
  getLoginPage() {
    return new LoginPage(this.page);
  }

  getAddCustomerPage() {
    return new AddCustomerPage(this.page);
  }

  getCustomerKYCPage() {
    return new CustomerKYCPage(this.page);
  }

  getInitiateGoldLoanPage() {
    return new InitiateGoldLoanPage(this.page);
  }

  getAppraiserRequestPage() {
    return new AppraiserRequestpage(this.page);
  }

  getUploadDocumentPage() {
    return new UploadDocumentPage(this.page);
  }

  getOperationTeamApprovalPage() {
    return new OperationTeamApprovalPage(this.page);
  }

  getPartnerDisburseAmountPage() {
    return new PartnerDisburseAmountPage(this.page);
  }

  getSubmitPacketDetailsPage() {
    return new SubmitPacketDetailsPage(this.page);
  }
}
