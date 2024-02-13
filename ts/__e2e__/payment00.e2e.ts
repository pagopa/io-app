import I18n from "../i18n";
import { e2eWaitRenderTimeout } from "./config";
import { ensureLoggedIn, openPaymentFromMessage } from "./utils";

describe("Payment", () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("When the user want to pay starting from a message and press back in the payment transaction summary screen, it should return to the message details screen", async () => {
    await openPaymentFromMessage();
    const backButton = element(by.id("back-button-transaction-summary"));
    await waitFor(backButton).toBeVisible().withTimeout(e2eWaitRenderTimeout);
    await backButton.tap();
    await waitFor(element(by.text(I18n.t("messageDetails.headerTitle"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
  });
});
