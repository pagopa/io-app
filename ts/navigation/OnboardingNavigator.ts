import {
  createStackNavigator,
  NavigationStackOptions,
  NavigationStackProp
} from "react-navigation-stack";
import { NavigationRoute, NavigationRouteConfigMap } from "react-navigation";
import EmailInsertScreen from "../screens/onboarding/EmailInsertScreen";
import EmailReadScreen from "../screens/onboarding/EmailReadScreen";
import FingerprintScreen from "../screens/onboarding/FingerprintScreen";
import OnboardingShareDataScreen from "../screens/onboarding/OnboardingShareDataScreen";
import PinScreen from "../screens/onboarding/PinScreen";
import TosScreen from "../screens/onboarding/TosScreen";
import OnboardingServicesPreferenceScreen from "../screens/onboarding/OnboardingServicesPreferenceScreen";
import ServicePreferenceCompleteScreen from "../screens/onboarding/ServicePreferenceCompleteScreen";
import { PremiumMessagesOptInOutScreen } from "../screens/onboarding/premiumMessages/PremiumMessagesOptInOutScreen";
import { premiumMessagesOptInEnabled } from "../config";
import ROUTES from "./routes";

/**
 * The routes used for the premium messages feature.
 */
const premiumMessagesRoutes: NavigationRouteConfigMap<
  NavigationStackOptions,
  NavigationStackProp<NavigationRoute, any>
> = premiumMessagesOptInEnabled
  ? {
      [ROUTES.ONBOARDING_PREMIUM_MESSAGES_OPT_IN_OUT]: {
        screen: PremiumMessagesOptInOutScreen
      }
    }
  : {};

/**
 * The onboarding related stack of screens of the application.
 */
const navigator = createStackNavigator(
  {
    [ROUTES.ONBOARDING_SHARE_DATA]: {
      screen: OnboardingShareDataScreen
    },
    [ROUTES.ONBOARDING_SERVICES_PREFERENCE]: {
      screen: OnboardingServicesPreferenceScreen
    },
    [ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE]: {
      screen: ServicePreferenceCompleteScreen
    },
    [ROUTES.ONBOARDING_TOS]: {
      screen: TosScreen
    },
    [ROUTES.ONBOARDING_PIN]: {
      screen: PinScreen
    },
    [ROUTES.ONBOARDING_FINGERPRINT]: {
      screen: FingerprintScreen
    },
    [ROUTES.INSERT_EMAIL_SCREEN]: {
      screen: EmailInsertScreen
    },
    [ROUTES.READ_EMAIL_SCREEN]: {
      screen: EmailReadScreen
    },
    ...premiumMessagesRoutes
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default navigator;
