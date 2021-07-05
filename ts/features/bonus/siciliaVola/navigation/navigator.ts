import { createStackNavigator } from "react-navigation";
import CheckStatusRouterScreen from "../screens/voucherGeneration/CheckStatusRouterScreen";
import SV_ROUTES from "./routes";
import SelectBeneficiaryCategoryScreen from "../screens/voucherGeneration/SelectBeneficiaryCategoryScreen";

const SvNavigator = createStackNavigator(
  {
    [SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS]: {
      screen: CheckStatusRouterScreen
    },
    [SV_ROUTES.VOUCHER_GENERATION.SELECT_BENEFICIARY_CATEGORY]: {
      screen: SelectBeneficiaryCategoryScreen
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
