import I18n from "../i18n";
import { e2eWaitRenderTimeout } from "./config";
import { closeKeyboard, completePaymentFlow, ensureLoggedIn } from "./utils";

describe("Payment", () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  it("When the user want to pay using the manual insertion, it should allow the user to complete a payment", async () => {
    await element(by.text(I18n.t("global.navigator.wallet"))).tap();
    await element(by.text(I18n.t("wallet.payNotice"))).tap();

    await element(by.id("barcodeScanBaseScreenTabInput")).tap();

    const matchNoticeCodeInput = by.id("NoticeCodeInputMask");
    await waitFor(element(matchNoticeCodeInput))
      .toExist()
      .withTimeout(e2eWaitRenderTimeout);

    await element(matchNoticeCodeInput).typeText("123123123123123123");
    await element(by.id("EntityCodeInputMask")).typeText("12345678901");

    // Close the keyboard
    await closeKeyboard();

    await element(by.text(I18n.t("global.buttons.continue"))).tap();

    await completePaymentFlow();
  });
});
