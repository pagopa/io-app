import I18n from "../i18n";
import { formatNumberCentsToAmount } from "../utils/stringBuilder";
import { e2eWaitRenderTimeout } from "./config";
import { ensureLoggedIn } from "./utils";

describe("Payment", () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await ensureLoggedIn();
  });

  describe("When the user want to pay starting from a message", () => {
    describe("And press back in the payment transaction summary screen", () => {
      it("Should return to the message details screen", async () => {
        await openPaymentFromMessage();
        const backButton = element(by.id("back-button-transaction-summary"));
        await waitFor(backButton)
          .toBeVisible()
          .withTimeout(e2eWaitRenderTimeout);
        await backButton.tap();
        await waitFor(element(by.text(I18n.t("messageDetails.headerTitle"))))
          .toBeVisible()
          .withTimeout(e2eWaitRenderTimeout);
      });

      describe("when navigating to the wallet", () => {
        it("then the wallet root screen should be visible", async () => {
          await openPaymentFromMessage();

          const backButton1 = element(by.id("back-button-transaction-summary"));
          await waitFor(backButton1)
            .toBeVisible()
            .withTimeout(e2eWaitRenderTimeout);
          await backButton1.tap();

          const backButton2 = element(by.id("back-button"));
          await waitFor(backButton2)
            .toBeVisible()
            .withTimeout(e2eWaitRenderTimeout);
          await backButton2.tap();

          const walletButton = element(
            by.text(I18n.t("global.navigator.wallet"))
          );
          await waitFor(walletButton)
            .toBeVisible()
            .withTimeout(e2eWaitRenderTimeout);
          await walletButton.tap();

          await waitFor(element(by.text(I18n.t("wallet.payNotice"))))
            .toBeVisible()
            .withTimeout(e2eWaitRenderTimeout);
        });
      });
    });

    describe("And press cancel in the payment confirm screen", () => {
      it("Should return to the message details screen", async () => {
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
        await waitFor(confirmCancel)
          .toExist()
          .withTimeout(e2eWaitRenderTimeout);
        await confirmCancel.tap();

        await waitFor(element(by.text(I18n.t("messageDetails.headerTitle"))))
          .toBeVisible()
          .withTimeout(e2eWaitRenderTimeout);
      });
    });

    // TODO: this could be executed just one time until we have a way to reset the dev server between tests
    it("Should allow the user to complete a payment", async () => {
      await openPaymentFromMessage();
      await completePaymentFlow();
    });
  });

  describe("When the user want to pay using the manual insertion", () => {
    it("Should allow the user to complete a payment", async () => {
      await element(by.text(I18n.t("global.navigator.wallet"))).tap();
      await element(by.text(I18n.t("wallet.payNotice"))).tap();

      await element(by.text(I18n.t("wallet.QRtoPay.setManually"))).tap();

      const matchNoticeCodeInput = by.id("NoticeCodeInputMask");
      await waitFor(element(matchNoticeCodeInput))
        .toExist()
        .withTimeout(e2eWaitRenderTimeout);

      await element(matchNoticeCodeInput).typeText("123123123123123123");
      await element(by.id("EntityCodeInputMask")).typeText("12345678901");
      // Close the keyboard
      await element(by.label("Done")).atIndex(0).tap();

      await element(by.text(I18n.t("global.buttons.continue"))).tap();

      await completePaymentFlow();
    });
  });
});

const completePaymentFlow = async () => {
  await waitFor(element(by.text(I18n.t("wallet.continue"))))
    .toExist()
    .withTimeout(e2eWaitRenderTimeout);
  await element(by.text(I18n.t("wallet.continue"))).tap();

  const matchConfirmPayment = by.text(
    `${I18n.t("wallet.ConfirmPayment.pay")} ${formatNumberCentsToAmount(
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
};

const openPaymentFromMessage = async () => {
  const messageWithPayment = element(
    by.id(`MessageListItem_00000000000000000000000021`)
  );
  await waitFor(messageWithPayment)
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  await messageWithPayment.tap();

  const seeNoticeButton = element(by.text(I18n.t("messages.cta.seeNotice")));
  await waitFor(seeNoticeButton)
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  await seeNoticeButton.tap();
};
