import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import SuggestBpdActivationScreen from "../../common/screens/bpd/SuggestBpdActivationScreen";
import SearchSatispayManagerScreen from "../screens/search/SearchSatispayManagerScreen";
import StartSatispaySearchScreen from "../screens/StartSatispaySearchScreen";
import WALLET_ONBOARDING_SATISPAY_ROUTES from "./routes";

const PaymentMethodOnboardingSatispayNavigator = createCompatNavigatorFactory(
  createStackNavigator
)(
  {
    [WALLET_ONBOARDING_SATISPAY_ROUTES.START]: {
      screen: StartSatispaySearchScreen
    },
    [WALLET_ONBOARDING_SATISPAY_ROUTES.SEARCH_AVAILABLE_USER_SATISPAY]: {
      screen: SearchSatispayManagerScreen
    },
    [WALLET_ONBOARDING_SATISPAY_ROUTES.SUGGEST_BPD_ACTIVATION]: {
      screen: SuggestBpdActivationScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gestureEnabled: false
    }
  }
);

export default PaymentMethodOnboardingSatispayNavigator;
