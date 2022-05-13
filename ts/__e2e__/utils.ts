import I18n from "../i18n";
import { e2ePinChar, e2eWaitRenderTimeout } from "./config";

const loginButtonId = "landing-button-login-spid";
const posteIdpButtonId = "idp-posteid-button";

/**
 * Complete the login with SPID
 */
export const loginWithSPID = async () => {
  await waitFor(element(by.id(loginButtonId)))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  await element(by.id(loginButtonId)).tap();

  await waitFor(element(by.id(posteIdpButtonId)))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  await element(by.id(posteIdpButtonId)).tap();

  // the webview returned by the server has 250ms timeout and reloads automagically

  await waitFor(
    element(by.text(I18n.t("profile.main.privacy.shareData.screen.title")))
  )
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  await element(
    by.text(I18n.t("profile.main.privacy.shareData.screen.cta.shareData"))
  ).tap();

  await waitFor(element(by.text(I18n.t("onboarding.pin.title"))))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  await createE2EPin();

  await waitFor(element(by.text(I18n.t("onboarding.thankYouPage.body"))))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  await element(by.text(I18n.t("global.buttons.continue")))
    // Here we are going to take the second element
    // because during the screen transition, inside the
    // hierarchy we are gonna have two continue buttons, one
    // from the current screen and one from the previous.
    .atIndex(1)
    .tap();
};

/**
 * This utility should be used during the authentication
 * step in the pin screen. It will leverage the IO Pinpad
 * to insert the pin.
 */
export const insertE2EPin = async () => {
  await element(by.text(e2ePinChar)).tap();
  await element(by.text(e2ePinChar)).tap();
  await element(by.text(e2ePinChar)).tap();
  await element(by.text(e2ePinChar)).tap();
  await element(by.text(e2ePinChar)).tap();
  await element(by.text(e2ePinChar)).tap();
};

/**
 * This utility should be used during the onboarding in the
 * pin creation screen, or in the same screen in the Profile section.
 * It will fill the two inputs with a pin and submit the form also
 * trying to insert wrong data during the process.
 */
export const createE2EPin = async () => {
  const pin =
    e2ePinChar + e2ePinChar + e2ePinChar + e2ePinChar + e2ePinChar + e2ePinChar;
  const wrongPin = "123456";

  await element(by.id("PinFieldInput")).typeText(pin);
  await element(by.id("PinConfirmationFieldInput")).typeText(wrongPin);

  await element(by.text(I18n.t("onboarding.pin.title"))).tap();
  await waitFor(element(by.text(I18n.t("global.buttons.continue"))))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  await element(by.text(I18n.t("global.buttons.continue"))).tap();

  await element(by.id("PinConfirmationFieldInput")).replaceText(pin);

  await element(by.text(I18n.t("onboarding.pin.title"))).tap();
  await waitFor(element(by.text(I18n.t("global.buttons.continue"))))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  await element(by.text(I18n.t("global.buttons.continue"))).tap();
};

/**
 * Ensures that the login with spid and the unlock code has been inserted
 */
export const ensureLoggedIn = async () => {
  try {
    await waitFor(element(by.text(I18n.t("identification.subtitleCode"))))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
    await insertE2EPin();
  } catch {
    await loginWithSPID();
  }
};
