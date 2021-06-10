import { createStackNavigator } from "react-navigation";
import SV_ROUTES from "./routes";
import CheckStatusRouterScreen from "../screens/voucherGeneration/CheckStatusRouterScreen";

const SvNavigator = createStackNavigator(
  {
    [SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS]: {
      screen: CheckStatusRouterScreen
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

export default SvNavigator;
