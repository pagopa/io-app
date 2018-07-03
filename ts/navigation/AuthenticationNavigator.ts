import { createStackNavigator } from "react-navigation";

import IdpLoginScreen from "../screens/authentication/IdpLoginScreen";
import IdpSelectionScreen from "../screens/authentication/IdpSelectionScreen";
import LandingScreen from "../screens/authentication/LandingScreen";
import SpidInformationRequestScreen from "../screens/authentication/SpidInformationRequestScreen";
import ROUTES from "./routes";

/**
 * The authentication related stack of screens of the application.
 */
const navigator = createStackNavigator(
  {
    [ROUTES.AUTHENTICATION_LANDING]: {
      screen: LandingScreen
    },
    [ROUTES.AUTHENTICATION_IDP_SELECTION]: {
      screen: IdpSelectionScreen
    },
    [ROUTES.AUTHENTICATION_IDP_LOGIN]: {
      screen: IdpLoginScreen
    },
    [ROUTES.AUTHENTICATION_SPID_INFORMATION_REQUEST]: {
      screen: SpidInformationRequestScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default navigator;
