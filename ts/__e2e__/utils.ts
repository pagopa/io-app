import {
  e2ePinChar1,
  e2ePinChar2,
  e2ePinChar3,
  e2ePinChar4,
  e2ePinChar5,
  e2ePinChar6,
  e2eWaitRenderTimeout
} from "./config";

const onboardingPinTitleId = "pin-creation-form-title";

/**
 * Complete the login with SPID
 */
export const loginWithSPID = async () => {
  const loginButtonId = "landing-button-login-spid";
  await waitFor(element(by.id(loginButtonId)))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  await element(by.id(loginButtonId)).tap();

  const posteIdpButtonId = "idp-posteid-button";
  await waitFor(element(by.id(posteIdpButtonId)))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  await element(by.id(posteIdpButtonId)).tap();

  // the webview returned by the server has 250ms timeout and reloads automagically

  const shareDataComponentTitleId = "share-data-component-title";
  await waitFor(element(by.id(shareDataComponentTitleId)))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  const shareDataRightButtonId = "share-data-confirm-button";
  await element(by.id(shareDataRightButtonId)).tap();

  await waitFor(element(by.id(onboardingPinTitleId)))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  await createE2EPin();
};

/**
 * This utility should be used during the authentication
 * step in the pin screen. It will leverage the IO Pinpad
 * to insert the pin.
 */
export const insertE2EPin = async () => {
  await element(by.text(e2ePinChar1)).tap();
  await element(by.text(e2ePinChar6)).tap();
  await element(by.text(e2ePinChar2)).tap();
  await element(by.text(e2ePinChar5)).tap();
  await element(by.text(e2ePinChar3)).tap();
  await element(by.text(e2ePinChar4)).tap();
};

/**
 * This utility should be used during the onboarding in the
 * pin creation screen, or in the same screen in the Profile section.
 * It will fill the two inputs with a pin and submit the form also
 * trying to insert wrong data during the process.
 */
export const createE2EPin = async () => {
  const pin =
    e2ePinChar1 +
    e2ePinChar6 +
    e2ePinChar2 +
    e2ePinChar5 +
    e2ePinChar3 +
    e2ePinChar4;
  const wrongPin = "123456";

  const onboardingPinFieldInputId = "PinFieldInput";
  await element(by.id(onboardingPinFieldInputId)).typeText(pin);

  const scrollView = element(by.id("pin-creation-form-scroll-view"));
  await scrollView.scrollTo("bottom");

  const onboardingPinConfirmationFieldId = "PinConfirmationFieldInput";
  await element(by.id(onboardingPinConfirmationFieldId)).typeText(wrongPin);

  const onboardingPinConfirmButtonId = "pin-creation-form-confirm";
  await waitFor(element(by.id(onboardingPinConfirmButtonId)))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  await scrollView.tap();

  await element(by.id(onboardingPinConfirmationFieldId)).clearText();
  await element(by.id(onboardingPinConfirmationFieldId)).typeText(pin);

  await element(by.id(onboardingPinConfirmButtonId)).tap();

  const onboardingNotEnrolledConfirmButtonId = "not-enrolled-biometric-confirm";
  await waitFor(element(by.id(onboardingNotEnrolledConfirmButtonId)))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  await element(by.id(onboardingNotEnrolledConfirmButtonId)).tap();
};

/**
 * Ensures that the login with spid and the unlock code has been inserted
 */
export const ensureLoggedIn = async () => {
  try {
    const identificationModalBodyId = "identification-modal-body";
    await waitFor(element(by.id(identificationModalBodyId)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
    await insertE2EPin();
  } catch {
    await loginWithSPID();
  }
};

export const closeKeyboard = async () => {
  // Sometimes the device ignores the locale set by the detox setup
  // In such case we can try to close the keyboard using the english translation
  try {
    await element(by.label("Fine")).atIndex(0).tap();
  } catch (e) {
    await element(by.label("Done")).atIndex(0).tap();
  }
};
