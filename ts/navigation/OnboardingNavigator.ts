import { createStackNavigator } from "react-navigation";
import EmailInsertScreen from "../screens/onboarding/EmailInsertScreen";

import FingerprintScreen from "../screens/onboarding/FingerprintScreen";
import PinScreen from "../screens/onboarding/PinScreen";
import TosScreen from "../screens/onboarding/TosScreen";
import ROUTES from "./routes";

/**
 * The onboarding related stack of screens of the application.
 */
const navigator = createStackNavigator(
  {
    [ROUTES.ONBOARDING_TOS]: {
      screen: TosScreen
    },
    [ROUTES.ONBOARDING_PIN]: {
      screen: PinScreen
    },
    [ROUTES.ONBOARDING_FINGERPRINT]: {
      screen: FingerprintScreen
    },
    [ROUTES.ONBOARDING_EMAIL_INSERT]: {
      screen: EmailInsertScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default navigator;
