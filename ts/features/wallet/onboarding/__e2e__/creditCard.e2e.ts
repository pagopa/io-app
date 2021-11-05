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

      await element(by.text(I18n.t("global.navigator.wallet"))).tap();

      await waitFor(
        element(by.text(I18n.t("wallet.newPaymentMethod.add").toUpperCase()))
      )
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

      await element(
        by.text(I18n.t("wallet.newPaymentMethod.add").toUpperCase())
      ).tap();

      await waitFor(element(by.text(I18n.t("wallet.paymentMethod"))))
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

      await element(by.text(I18n.t("wallet.paymentMethod"))).tap();

      await waitFor(element(by.text(I18n.t("wallet.methods.card.name"))))
        .toBeVisible()
        .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

      await element(by.text(I18n.t("wallet.methods.card.name"))).tap();
    });
  });
});
