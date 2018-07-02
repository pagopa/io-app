import { StackNavigator } from "react-navigation";

import PinScreen from "../screens/onboarding/PinScreen";
import TosScreen from "../screens/onboarding/TosScreen";
import { SafeNavigationScreenComponent } from "../types/redux_navigation";
import ROUTES from "./routes";

/**
 * The onboarding related stack of screens of the application.
 */
const navigator = StackNavigator(
  {
    [ROUTES.ONBOARDING_TOS]: {
      screen: TosScreen as SafeNavigationScreenComponent<typeof TosScreen>
    },
    [ROUTES.ONBOARDING_PIN]: {
      screen: PinScreen as SafeNavigationScreenComponent<typeof PinScreen>
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default navigator;
