import { createStackNavigator } from "react-navigation";
import CheckStatusRouterScreen from "../screens/voucherGeneration/CheckStatusRouterScreen";
import SV_ROUTES from "./routes";

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
