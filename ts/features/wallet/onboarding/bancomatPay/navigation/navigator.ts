import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import BPaySearchBankScreen from "../screens/search/BPaySearchBankScreen";
import BPaySearchStartScreen from "../screens/search/BPaySearchStartScreen";
import SearchAvailableUserBPayScreen from "../screens/searchBPay/SearchAvailableUserBPayScreen";
import WALLET_ONBOARDING_BPAY_ROUTES from "./routes";

const PaymentMethodOnboardingBPayNavigator = createCompatNavigatorFactory(
  createStackNavigator
)(
  {
    [WALLET_ONBOARDING_BPAY_ROUTES.START]: {
      screen: BPaySearchStartScreen
    },
    [WALLET_ONBOARDING_BPAY_ROUTES.CHOOSE_BANK]: {
      screen: BPaySearchBankScreen
    },
    [WALLET_ONBOARDING_BPAY_ROUTES.SEARCH_AVAILABLE_USER_ACCOUNT]: {
      screen: SearchAvailableUserBPayScreen
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

export default PaymentMethodOnboardingBPayNavigator;
