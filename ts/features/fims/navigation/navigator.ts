import { constNull } from "fp-ts/lib/function";
import { createStackNavigator } from "react-navigation-stack";
import FIMS_ROUTES from "./routes";

const FimsNavigator = createStackNavigator(
  {
    [FIMS_ROUTES.WEBVIEW]: {
      screen: constNull
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

export default FimsNavigator;
