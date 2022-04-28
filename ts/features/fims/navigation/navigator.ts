import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import FimsWebviewScreen from "../screens/FimsWebviewScreen";
import FIMS_ROUTES from "./routes";

export const FimsNavigator = createCompatNavigatorFactory(createStackNavigator)(
  {
    [FIMS_ROUTES.WEBVIEW]: {
      screen: FimsWebviewScreen
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
