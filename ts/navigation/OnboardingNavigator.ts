import { createStackNavigator } from "react-navigation";

import EmailInsertScreen from "../screens/onboarding/EmailInsertScreen";
import EmailReadScreen from "../screens/onboarding/EmailReadScreen";
import FingerprintScreen from "../screens/onboarding/FingerprintScreen";
import OnboardingShareDataScreen from "../screens/onboarding/OnboardingShareDataScreen";
import PinScreen from "../screens/onboarding/PinScreen";
import TosScreen from "../screens/onboarding/TosScreen";
import OnboardingServicesPreferenceScreen from "../screens/onboarding/OnboardingServicesPreferenceScreen";
import ServicePreferenceCompleteScreen from "../screens/onboarding/ServicePreferenceCompleteScreen";
import ROUTES from "./routes";

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
    }
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
