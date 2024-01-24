import { e2eWaitRenderTimeout } from "../../../../__e2e__/config";
import { closeKeyboard, ensureLoggedIn } from "../../../../__e2e__/utils";
import I18n from "../../../../i18n";

describe("Credit Card onboarding", () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  describe("when the user inserts all the required valid data", () => {
    it("should add successfully the credit card to the wallet", async () => {
      await waitFor(element(by.text(I18n.t("global.navigator.wallet"))))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);

      // Footer, Wallet icon
      await element(by.text(I18n.t("global.navigator.wallet"))).tap();

      await waitFor(element(by.id("walletAddNewPaymentMethodTestId")))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);

      // Button "+ Add"
      await element(by.id("walletAddNewPaymentMethodTestId")).tap();

      await waitFor(element(by.id("wallet.paymentMethod")))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);

      // Add payment method listItem in bottomSheet
      await element(by.id("wallet.paymentMethod")).tap();

      await waitFor(element(by.text(I18n.t("wallet.methods.card.name"))))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);
      // Add Credit Card List Item
      await element(by.text(I18n.t("wallet.methods.card.name"))).tap();

      await waitFor(element(by.id("cardHolderInput")))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);

      // Fill the credit card data
      await element(by.id("cardHolderInput")).typeText("Gian Maria Mario");

      await element(by.id("panInputMask")).typeText("4444333322221111");

      await element(by.id("expirationDateInputMask")).typeText("1299");

      await element(by.id("securityCodeInputMask")).typeText("123");

      // Close the keyboard
      await closeKeyboard();
      await element(by.text(I18n.t("global.buttons.continue"))).tap();

      await waitFor(element(by.id("saveOrContinueButton")))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);
      await element(by.id("saveOrContinueButton")).tap();

      // Wait for 3ds webview
      await waitFor(element(by.text(I18n.t("wallet.challenge3ds.description"))))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);

      // Wait for success screen
      await waitFor(
        element(
          by.text(I18n.t("wallet.outcomeMessage.addCreditCard.success.title"))
        )
      )
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);

      // Wait for return to wallet
      await waitFor(element(by.id("wallet-home-header-title")))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);
    });
  });
});
