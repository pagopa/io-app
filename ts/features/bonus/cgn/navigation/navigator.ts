import { createStackNavigator } from "react-navigation";
import CgnInformationScreen from "../screens/onboarding/CgnInformationScreen";
import CGN_ROUTES from "./routes";

const CgnNavigator = createStackNavigator(
  {
    [CGN_ROUTES.ACTIVATION.INFORMATION_TOS]: {
      screen: CgnInformationScreen
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
