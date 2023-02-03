import { changeText, press, toExist } from "react-native-owl";

export const loginButtonId = "landing-button-login-spid";
export const posteIdpButtonId = "idp-posteid-button";
export const confirmShareDataButtonId = "rightButton";
export const confirmPinButtonId = "leftButton";
export const pinFieldId = "PinFieldInput";
export const pinConfirmationFieldId = "PinConfirmationFieldInput";

export const RNOWL_JEST_TIMOUT = 15 * 1000;

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for Login Screen
 */
export const waitForLoginScreen = async () => await toExist(loginButtonId);

/**
 * Wait for SPID IdPs Screen
 */
export const waitForSpidScreen = async () => {
  await press(loginButtonId);
  await toExist(posteIdpButtonId);
};

/**
 * Login with PosteID
 */
export const loginWithPosteID = async () => {
  await press(posteIdpButtonId);
  await toExist(confirmShareDataButtonId);
};

export const waitForPinScreen = async () => {
  await press(confirmShareDataButtonId);
  await toExist(confirmPinButtonId);
};

export const setPinAnGoAhead = async () => {
  await changeText(pinFieldId, "111111");
  await changeText(pinConfirmationFieldId, "111111");
  await sleep(2000); // wait for button to be enabled.
  await press(confirmPinButtonId);
};
