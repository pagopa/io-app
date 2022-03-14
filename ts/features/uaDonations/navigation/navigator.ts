import { createStackNavigator } from "react-navigation-stack";
import { UAWebViewScreen } from "../screens/UAWebViewScreen";
import UADONATION_ROUTES from "./routes";

const UADonationNavigator = createStackNavigator(
  {
    [UADONATION_ROUTES.WEBVIEW]: {
      screen: UAWebViewScreen
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

export default UADonationNavigator;
