/* eslint-disable */
import * as detox from "detox";
import adapter from "detox/runners/jest/adapter";

import I18n, { setLocale } from "../i18n";
import { formatNumberCentsToAmount } from "../utils/stringBuilder";

const config = require("../../package.json").detox;

// Set the default test timeout (in milliseconds)
jest.setTimeout(5 * 60 * 1000);
(jasmine as any).getEnv().addReporter(adapter);

// 10 seconds seems a lot in development, but lower values are causing false positives
// on the CI environment. Don't touch it if you don't know what you are doing.
const WAIT_TIMEOUT_MS = 10 * 1000;

describe("e2e app", () => {
  const loginButtonId = "landing-button-login-spid";
  const posteIdpButtonId = "idp-posteid-button";

  beforeAll(async () => {
    await detox.init(config, { launchApp: false });
    await device.launchApp({
      permissions: { notifications: "YES", camera: "YES" }
    });
    // enforce IT locale because that's how the API are configured
    setLocale("it");
  });

  afterAll(async () => {
    await adapter.afterAll();
    await detox.cleanup();
  });

  afterEach(async () => {
    // go back to the initial screen
    await element(by.text(I18n.t("global.navigator.messages"))).tap();
  });

  describe("when the user never logged in before", () => {
    it("should let the user log in", async () => {
      await waitFor(element(by.id(loginButtonId)))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(by.id(loginButtonId)).tap();

      await waitFor(element(by.id(posteIdpButtonId)))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(by.id(posteIdpButtonId)).tap();

      // the webview returned by the server has 250ms timeout and reloads automagically

      await waitFor(
        element(by.text(I18n.t("profile.main.privacy.shareData.screen.title")))
      )
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(
        by.text(I18n.t("profile.main.privacy.shareData.screen.cta.shareData"))
      ).tap();

      await waitFor(
        element(by.text(I18n.t("onboarding.unlockCode.contentTitle")))
      )
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();

      await waitFor(
        element(by.text(I18n.t("onboarding.unlockCode.contentTitleConfirm")))
      )
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();
      await element(by.text("2")).tap();

      await element(by.text(I18n.t("global.buttons.continue"))).tap();
    });
  });

  describe("when the user is already logged in", () => {
    it("should load the user's messages", async () => {
      await waitFor(element(by.text(I18n.t("messages.contentTitle"))))
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      // The webserver is sending us exactly 20 messages with consecutive IDs
      // in reverse order.
      // We test that the first one is visible on the UI and that the last one
      // exists (but is not visible)

      await waitFor(
        element(by.id(`MessageListItem_00000000000000000000000020`))
      )
        .toBeVisible()
        .withTimeout(WAIT_TIMEOUT_MS);

      await waitFor(
        element(by.id(`MessageListItem_00000000000000000000000001`))
      )
        .toExist()
        .withTimeout(WAIT_TIMEOUT_MS);
    });

    it("should let the user pay a notice", async () => {
      await element(by.text(I18n.t("global.navigator.wallet"))).tap();
      await element(by.text(I18n.t("wallet.payNotice"))).tap();

      await element(by.text(I18n.t("wallet.QRtoPay.setManually"))).tap();

      const matchNoticeCodeInput = by.id("NoticeCodeInput");
      await waitFor(element(matchNoticeCodeInput))
        .toExist()
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(matchNoticeCodeInput).replaceText("123123123123123123");
      await element(by.id("EntityCodeInput")).replaceText("12345678901");

      await element(by.text(I18n.t("global.buttons.continue"))).tap();
      // await element(by.label("Continua")).tap();

      await waitFor(element(by.label(I18n.t("wallet.continue"))))
        .toExist()
        .withTimeout(WAIT_TIMEOUT_MS);
      await element(by.label(I18n.t("wallet.continue"))).tap();

      const matchConfirmPayment = by.text(
        `${I18n.t("wallet.ConfirmPayment.goToPay")} ${formatNumberCentsToAmount(
          2322,
          true
        )}`
      );
      await waitFor(element(matchConfirmPayment))
        .toExist()
        .withTimeout(WAIT_TIMEOUT_MS);
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
        .withTimeout(WAIT_TIMEOUT_MS);

      await element(by.text(I18n.t("wallet.outcomeMessage.cta.close"))).tap();
    });
  });
});
