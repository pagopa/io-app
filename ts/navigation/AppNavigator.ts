import { createStackNavigator } from "react-navigation";

import BackgroundScreen from "../screens/BackgroundScreen";
import IngressScreen from "../screens/IngressScreen";
import AuthenticationNavigator from "./AuthenticationNavigator";
import MainNavigator from "./MainNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import PinNavigator from "./PinNavigator";
import ROUTES from "./routes";

/**
 * The main stack of screens of the Application.
 */
const navigator = createStackNavigator(
  {
    [ROUTES.INGRESS]: {
      // This screen check if the user is authenticated than perform a redirect to
      // MainNavigator (if authenticated) or AuthenticationNavigator (otherwise)
      screen: IngressScreen
    },
    [ROUTES.BACKGROUND]: {
      screen: BackgroundScreen
    },
    [ROUTES.AUTHENTICATION]: {
      // The navigator used for unauthenticated users
      screen: AuthenticationNavigator
    },
    [ROUTES.ONBOARDING]: {
      screen: OnboardingNavigator
    },
    [ROUTES.PIN_LOGIN]: {
      screen: PinNavigator
    },
    [ROUTES.MAIN]: {
      // The navigator used for authenticated users
      screen: MainNavigator
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default navigator;
