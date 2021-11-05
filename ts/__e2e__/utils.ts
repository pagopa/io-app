import I18n from "../i18n";
import { E2E_PIN_CHAR, E2E_WAIT_RENDER_TIMEOUT_MS } from "./config";

const loginButtonId = "landing-button-login-spid";
const posteIdpButtonId = "idp-posteid-button";

/**
 * Complete the login with SPID
 */
export const loginWithSPID = async () => {
  await waitFor(element(by.id(loginButtonId)))
    .toBeVisible()
    .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

  await element(by.id(loginButtonId)).tap();

  await waitFor(element(by.id(posteIdpButtonId)))
    .toBeVisible()
    .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

  await element(by.id(posteIdpButtonId)).tap();

  // the webview returned by the server has 250ms timeout and reloads automagically

  await waitFor(
    element(by.text(I18n.t("profile.main.privacy.shareData.screen.title")))
  )
    .toBeVisible()
    .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

  await element(
    by.text(I18n.t("profile.main.privacy.shareData.screen.cta.shareData"))
  ).tap();

  await waitFor(element(by.text(I18n.t("onboarding.unlockCode.contentTitle"))))
    .toBeVisible()
    .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

  await insertE2EPin();

  await waitFor(
    element(by.text(I18n.t("onboarding.unlockCode.contentTitleConfirm")))
  )
    .toBeVisible()
    .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);

  await insertE2EPin();

  await element(by.text(I18n.t("global.buttons.continue"))).tap();
};

export const insertE2EPin = async () => {
  await element(by.text(E2E_PIN_CHAR)).tap();
  await element(by.text(E2E_PIN_CHAR)).tap();
  await element(by.text(E2E_PIN_CHAR)).tap();
  await element(by.text(E2E_PIN_CHAR)).tap();
  await element(by.text(E2E_PIN_CHAR)).tap();
  await element(by.text(E2E_PIN_CHAR)).tap();
};

/**
 * Ensures that the login with spid and the unlock code has been inserted
 */
export const ensureLoggedIn = async () => {
  try {
    await waitFor(element(by.text(I18n.t("identification.subtitleCode"))))
      .toBeVisible()
      .withTimeout(E2E_WAIT_RENDER_TIMEOUT_MS);
    await insertE2EPin();
  } catch {
    await loginWithSPID();
  }
};
