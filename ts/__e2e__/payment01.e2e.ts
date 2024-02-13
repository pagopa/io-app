import I18n from "../i18n";
import { e2eWaitRenderTimeout } from "./config";
import { ensureLoggedIn, openPaymentFromMessage } from "./utils";

describe("Payment", () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("When the user want to pay starting from a message and press back in the payment transaction summary screen, when navigating to the wallet then the wallet root screen should be visible", async () => {
    await openPaymentFromMessage();

    const backButton1 = element(by.id("back-button-transaction-summary"));
    await waitFor(backButton1).toBeVisible().withTimeout(e2eWaitRenderTimeout);
    await backButton1.tap();

    const backButton2 = element(by.id("back-button"));
    await waitFor(backButton2).toBeVisible().withTimeout(e2eWaitRenderTimeout);
    await backButton2.tap();

    const walletButton = element(by.text(I18n.t("global.navigator.wallet")));
    await waitFor(walletButton).toBeVisible().withTimeout(e2eWaitRenderTimeout);
    await walletButton.tap();

    await waitFor(element(by.text(I18n.t("wallet.payNotice"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
  });
});
