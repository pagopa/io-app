import { StackNavigator } from "react-navigation";

import IdpLoginScreen from "../screens/authentication/IdpLoginScreen";
import IdpSelectionScreen from "../screens/authentication/IdpSelectionScreen";
import LandingScreen from "../screens/authentication/LandingScreen";
import SpidInformationRequestScreen from "../screens/authentication/SpidInformationRequestScreen";
import { SafeNavigationScreenComponent } from "../types/redux_navigation";
import ROUTES from "./routes";

/**
 * The authentication related stack of screens of the application.
 */
const navigator = StackNavigator(
  {
    [ROUTES.AUTHENTICATION_LANDING]: {
      screen: LandingScreen as SafeNavigationScreenComponent<
        typeof LandingScreen
      >
    },
    [ROUTES.AUTHENTICATION_IDP_SELECTION]: {
      screen: IdpSelectionScreen as SafeNavigationScreenComponent<
        typeof IdpSelectionScreen
      >
    },
    [ROUTES.AUTHENTICATION_IDP_LOGIN]: {
      screen: IdpLoginScreen as SafeNavigationScreenComponent<
        typeof IdpLoginScreen
      >
    },
    [ROUTES.AUTHENTICATION_SPID_INFORMATION_REQUEST]: {
      screen: SpidInformationRequestScreen as SafeNavigationScreenComponent<
        typeof SpidInformationRequestScreen
      >
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default navigator;
