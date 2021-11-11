import adapter from "detox/runners/jest/adapter";

import I18n from "../i18n";
import { formatNumberCentsToAmount } from "../utils/stringBuilder";
import { e2eWaitRenderTimeout } from "./config";
import { ensureLoggedIn } from "./utils";

describe("Payment", () => {
  beforeEach(async () => {
    await adapter.beforeEach();
    await device.reloadReactNative();
    await ensureLoggedIn();
  });

  describe("when the user want to pay using the manual insertion", () => {
    it("should allow the user to complete a payment", async () => {
      await element(by.text(I18n.t("global.navigator.wallet"))).tap();
      await element(by.text(I18n.t("wallet.payNotice"))).tap();

      await element(by.text(I18n.t("wallet.QRtoPay.setManually"))).tap();

      const matchNoticeCodeInput = by.id("NoticeCodeInput");
      await waitFor(element(matchNoticeCodeInput))
        .toExist()
        .withTimeout(e2eWaitRenderTimeout);

      await element(matchNoticeCodeInput).replaceText("123123123123123123");
      await element(by.id("EntityCodeInput")).replaceText("12345678901");

      await element(by.text(I18n.t("global.buttons.continue"))).tap();
      // await element(by.label("Continua")).tap();

      await waitFor(element(by.label(I18n.t("wallet.continue"))))
        .toExist()
        .withTimeout(e2eWaitRenderTimeout);
      await element(by.label(I18n.t("wallet.continue"))).tap();

      const matchConfirmPayment = by.text(
        `${I18n.t("wallet.ConfirmPayment.goToPay")} ${formatNumberCentsToAmount(
          2322,
          true
        )}`
      );
      await waitFor(element(matchConfirmPayment))
        .toExist()
        .withTimeout(e2eWaitRenderTimeout);
      await element(matchConfirmPayment).tap();

      await waitFor(
        element(
          by.text(
            I18n.t("payment.paidConfirm", {
              amount: formatNumberCentsToAmount(2322, true)
            })
          )
        )
      )
        .toExist()
        .withTimeout(e2eWaitRenderTimeout);

      await element(by.text(I18n.t("wallet.outcomeMessage.cta.close"))).tap();
    });
  });
});
