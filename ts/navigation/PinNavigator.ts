import { StackNavigator } from "react-navigation";

import PinLoginScreen from "../screens/PinLoginScreen";
import { SafeNavigationScreenComponent } from "../types/redux_navigation";
import ROUTES from "./routes";

/**
 * The onboarding related stack of screens of the application.
 */
const navigator = StackNavigator(
  {
    [ROUTES.PIN_LOGIN]: {
      screen: PinLoginScreen as SafeNavigationScreenComponent<
        typeof PinLoginScreen
      >
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default navigator;
