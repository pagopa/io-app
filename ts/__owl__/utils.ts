import { toExist } from "react-native-owl";

const loginButtonId = "landing-button-login-spid";

/**
 * Complete the login with SPID
 */
export const waitForLoginScreen = async () => await toExist(loginButtonId);
