import adapter from "detox/runners/jest/adapter";
import { E2E_WAIT_RENDER_TIMEOUT_MS } from "../../../../__e2e__/config";
import { ensureLoggedIn } from "../../../../__e2e__/utils";
import I18n from "../../../../i18n";

describe("Credit Card onboarding", () => {
  beforeEach(async () => {
    await adapter.beforeEach();
    await device.reloadReactNative();
    await ensureLoggedIn();
  });

  describe("when the user inserts all the required valid data", () => {
    it("should add successfully the credit card to the wallet", async () => {
      await waitFor(element(by.text(I18n.t("global.navigator.wallet"))))
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

      // Footer, Wallet icon
      await element(by.text(I18n.t("global.navigator.wallet"))).tap();

      await waitFor(
        element(by.text(I18n.t("wallet.newPaymentMethod.add").toUpperCase()))
      )
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

      // Button "+ Add"
      await element(
        by.text(I18n.t("wallet.newPaymentMethod.add").toUpperCase())
      ).tap();

      await waitFor(element(by.text(I18n.t("wallet.paymentMethod"))))
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

      // Add payment method listItem in bottomSheet
      await element(by.text(I18n.t("wallet.paymentMethod"))).tap();

      await waitFor(element(by.text(I18n.t("wallet.methods.card.name"))))
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);
      // Add Credit Card List Item
      await element(by.text(I18n.t("wallet.methods.card.name"))).tap();

      await waitFor(element(by.id("cardHolderInput")))
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

      // Fill the credit card data
      await element(by.id("cardHolderInput")).typeText("Gian Maria Mario");

      await element(by.id("panInputMask")).typeText("4444333322221111");

      await element(by.id("expirationDateInputMask")).typeText("1299");

      await element(by.id("securityCodeInputMask")).typeText("123");

      // Close the keyboard
      await element(by.label("Done")).atIndex(0).tap();
      await element(by.text(I18n.t("global.buttons.continue"))).tap();

      await waitFor(element(by.text(I18n.t("wallet.saveCard.save"))))
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);
      await element(by.text(I18n.t("wallet.saveCard.save"))).tap();

      // Wait for 3ds webview
      await waitFor(element(by.text(I18n.t("wallet.challenge3ds.description"))))
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

      // Wait for success screen
      await waitFor(
        element(
          by.text(I18n.t("wallet.outcomeMessage.addCreditCard.success.title"))
        )
      )
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

      // Wait for return to wallet
      await waitFor(element(by.text(I18n.t("wallet.wallet"))))
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);
    });
  });
});
