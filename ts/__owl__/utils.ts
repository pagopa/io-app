import { press, toExist } from "react-native-owl";

const loginButtonId = "landing-button-login-spid";
const posteIdpButtonId = "idp-posteid-button";
const confirmShareDataButtonId = "rightButton";

export const RNOWL_JEST_TIMOUT = 10 * 1000;

/**
 * Wait for Login Screen
 */
export const waitForLoginScreen = async () => await toExist(loginButtonId);

/**
 * Wait for SPID IdPs Screen
 */
export const waitForSpidScreen = async () => {
  await waitForLoginScreen();
  await press(loginButtonId);
  await toExist(posteIdpButtonId);
};

/**
 * Login with PosteID
 */
export const loginWithPosteID = async () => {
  await waitForSpidScreen();
  await press(posteIdpButtonId);
  await toExist(confirmShareDataButtonId);
};

export const waitForPinScreen = async () => {
  await loginWithPosteID();
  await press(confirmShareDataButtonId);
};
