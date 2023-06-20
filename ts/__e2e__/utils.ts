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

  const onboardingPingFieldInputId = "PinFieldInput";
  await element(by.id(onboardingPingFieldInputId)).typeText(pin);

  const onboardingPinConfirmationFieldId = "PinConfirmationFieldInput";
  await element(by.id(onboardingPinConfirmationFieldId)).typeText(wrongPin);

  await element(by.id(onboardingPinTitleId)).tap();

  const onboardingPinConfirmButtonId = "pin-creation-form-confirm";
  await waitFor(element(by.id(onboardingPinConfirmButtonId)))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  await element(by.id(onboardingPinTitleId)).tap();

  await element(by.id(onboardingPinConfirmationFieldId)).replaceText(pin);

  await element(by.id(onboardingPinTitleId)).tap();
  await waitFor(element(by.id(onboardingPinConfirmButtonId)))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  await element(by.id(onboardingPinConfirmButtonId)).tap();
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
