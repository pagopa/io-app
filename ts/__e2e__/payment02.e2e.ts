import I18n from "../i18n";
import { e2eWaitRenderTimeout } from "./config";
import { ensureLoggedIn, openPaymentFromMessage } from "./utils";

describe("Payment", () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("When the user want to pay starting from a message and press cancel in the payment confirm screen, it should return to the message details screen", async () => {
    await openPaymentFromMessage();
    await waitFor(element(by.text(I18n.t("wallet.continue"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
    await element(by.text(I18n.t("wallet.continue"))).tap();

    await waitFor(element(by.text(I18n.t("wallet.ConfirmPayment.header"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);

    const cancelButton = element(by.id("cancelPaymentButton"));
    // const cancelButton = element(by.id("cancelPaymentButton"));
    await waitFor(cancelButton).toExist().withTimeout(e2eWaitRenderTimeout);
    await cancelButton.tap();
    // I18n.t("wallet.ConfirmPayment.confirmCancelPayment")
    const confirmCancel = element(
      by.label(I18n.t("wallet.ConfirmPayment.confirmCancelPayment"))
    ).atIndex(0);
    await waitFor(confirmCancel).toExist().withTimeout(e2eWaitRenderTimeout);
    await confirmCancel.tap();

    await waitFor(element(by.text(I18n.t("messageDetails.headerTitle"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
  });
});
