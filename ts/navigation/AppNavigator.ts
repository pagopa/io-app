import { SwitchNavigator } from "react-navigation";

import { ManuallyIdentifyTransactionScreen } from "../screens/wallet/ManuallyIdentifyTransactionScreen";
import AuthenticationNavigator from "./AuthenticationNavigator";
import MainNavigator from "./MainNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import ROUTES from "./routes";

/**
 * The main stack of screens of the application.
 * SwitchNavigator is very useful here because it automatically
 * resets the state on navigation
 */
const navigator = SwitchNavigator({
  [ROUTES.INGRESS]: {
    // This screen check if the user is authenticated than perform a redirect to
    // MainNavigator (if authenticated) or AuthenticationNavigator (otherwise)
    screen: ManuallyIdentifyTransactionScreen // IngressScreen
  },
  [ROUTES.AUTHENTICATION]: {
    // The navigator used for unauthenticated users
    screen: AuthenticationNavigator
  },
  [ROUTES.ONBOARDING]: {
    screen: OnboardingNavigator
  },
  [ROUTES.MAIN]: {
    // The navigator used for authenticated users
    screen: MainNavigator
  }
});

export default navigator;
