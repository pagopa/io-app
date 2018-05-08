import { StackNavigator } from "react-navigation";

import PinLoginScreen from "../screens/PinLoginScreen";
import ROUTES from "./routes";

/**
 * The onboarding related stack of screens of the application.
 */
const navigator = StackNavigator(
  {
    [ROUTES.PINLOGIN]: {
      screen: PinLoginScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default navigator;
