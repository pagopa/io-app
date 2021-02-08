import { createStackNavigator } from "react-navigation";
import CgnInformationScreen from "../screens/activation/CgnInformationScreen";
import CgnActivationLoadingScreen from "../screens/activation/CgnActivationLoadingScreen";
import CgnActivationPendingScreen from "../screens/activation/CgnActivationPendingScreen";
import CgnActivationTimeoutScreen from "../screens/activation/CgnActivationTimeoutScreen";
import CgnActivationCompletedScreen from "../screens/activation/CgnActivationCompletedScreen";
import CGN_ROUTES from "./routes";

const CgnNavigator = createStackNavigator(
  {
    [CGN_ROUTES.ACTIVATION.INFORMATION_TOS]: {
      screen: CgnInformationScreen
    },
    [CGN_ROUTES.ACTIVATION.LOADING]: {
      screen: CgnActivationLoadingScreen
    },
    [CGN_ROUTES.ACTIVATION.PENDING]: {
      screen: CgnActivationPendingScreen
    },
    [CGN_ROUTES.ACTIVATION.TIMEOUT]: {
      screen: CgnActivationTimeoutScreen
    },
    [CGN_ROUTES.ACTIVATION.COMPLETED]: {
      screen: CgnActivationCompletedScreen
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

export default CgnNavigator;
