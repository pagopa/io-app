import { press, toExist } from "react-native-owl";

const loginButtonId = "landing-button-login-spid";
const posteIdpButtonId = "idp-posteid-button";

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
  // await toExist("buttonRight");
};
