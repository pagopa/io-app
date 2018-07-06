import { createStackNavigator } from "react-navigation";

import PinLoginScreen from "../screens/PinLoginScreen";
import ROUTES from "./routes";

/**
 * The onboarding related stack of screens of the application.
 */
const navigator = createStackNavigator(
  {
    [ROUTES.PIN_LOGIN]: {
      screen: PinLoginScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default navigator;
