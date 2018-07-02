import { createSwitchNavigator } from "react-navigation";

import IngressScreen from "../screens/IngressScreen";
import AuthenticationNavigator from "./AuthenticationNavigator";
import MainNavigator from "./MainNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import PinNavigator from "./PinNavigator";
import ROUTES from "./routes";
/**
 * The main stack of screens of the application.
 * SwitchNavigator is very useful here because it automatically
 * resets the state on navigation
 */
const navigator = createSwitchNavigator({
  [ROUTES.INGRESS]: {
    // This screen check if the user is authenticated than perform a redirect to
    // MainNavigator (if authenticated) or AuthenticationNavigator (otherwise)
    screen: IngressScreen
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
});

export default navigator;
