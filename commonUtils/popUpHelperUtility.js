import { expect } from "@playwright/test";

export async function cpvMandatoryPopup(
  page,
  cpvManadatorPopUp,
  popUpOkButton,
) {
  try {
    await cpvManadatorPopUp.waitFor({ state: "visible", timeout: 6000 });

    if (await cpvManadatorPopUp.isVisible()) {
      await popUpOkButton.click();
      await page.waitForTimeout(2000);

      console.info(
        "CPV Mandatory PopUp is visible and accepted while applying new loan",
      );
    } else {
      console.info("CPV Mandatory Pop-up is not asked while applying new loan");
    }
  } catch (err) {
    console.error("Error in CPV Mandatory PopUp", err);
    throw err; // Re-throw so test fails properly
  }
}

export async function savePacketPopup(
  page,
  savePacketPopup,
  savePacketYesButton,
) {
  try {
    await page.waitForTimeout(1500);

    await savePacketPopup.waitFor({ state: "visible", timeout: 6000 });

    if (await savePacketPopup.isVisible()) {
      await savePacketYesButton.click();
      await page.waitForTimeout(2000);

      console.info(
        "Are you sure you want to save packets popup handled successfully",
      );
    } else {
      console.info("Save Packet popup is not displayed");
    }
  } catch (err) {
    console.error("Error in Save Packet PopUp", err);
    throw err; // Re-throw so test fails properly
  }
}

export async function OSVDoneForCustomerPopup(
  page,
  confirmationPopUp,
  yesButton,
) {
  try {
    await confirmationPopUp.waitFor({ state: "visible", timeout: 6000 });

    if (await confirmationPopUp.isVisible()) {
      console.info("Confirmation gets visible ");
      await yesButton.click({ timeout: 4000, force: true });
      await page.waitForTimeout(2000);

      console.info("Confirmation pop-up is visible & handled");
    } else {
      console.info("Confirmation pop-up is not asked");
    }
  } catch (err) {
    console.error("Error in confirmation pop-up", err);
    throw err; // Re-throw so test fails properly
  }
}

export async function confirmationOfPayment(
  page,
  paymentDisbursePopup,
  yesButton,
) {
  try {
    await paymentDisbursePopup.waitFor({ state: "visible", timeout: 3000 });

    if (await paymentDisbursePopup.isVisible()) {
      console.info("Payment confirmation Popup gets visible ");
      await yesButton.click({ timeout: 4000, force: true });
      await page.waitForTimeout(2000);
    } else {
      console.info("Payment confirmation Popup is not asked");
    }
  } catch (err) {
    console.error("Error in confirmation pop-up", err);
    throw err; // Re-throw so test fails properly
  }
}
