import { createStackNavigator } from "react-navigation";
import BPaySearchStartScreen from "../screens/search/BPaySearchStartScreen";
import BPaySearchBankScreen from "../screens/search/BPaySearchBankScreen";
import SearchAvailableUserBPayScreen from "../screens/searchBPay/SearchAvailableUserBPayScreen";
import ActivateBpdOnNewBPayScreen from "../screens/ActivateBpdOnNewBPayScreen";
import AddBPayScreen from "../screens/add-account/AddBPayScreen";
import WALLET_ONBOARDING_BPAY_ROUTES from "./routes";

const PaymentMethodOnboardingBPayNavigator = createStackNavigator(
  {
    [WALLET_ONBOARDING_BPAY_ROUTES.START]: {
      screen: BPaySearchStartScreen
    },
    [WALLET_ONBOARDING_BPAY_ROUTES.CHOOSE_BANK]: {
      screen: BPaySearchBankScreen
    },
    [WALLET_ONBOARDING_BPAY_ROUTES.SEARCH_AVAILABLE_USER_ACCOUNT]: {
      screen: SearchAvailableUserBPayScreen
    },
    [WALLET_ONBOARDING_BPAY_ROUTES.ADD_BPAY]: {
      screen: AddBPayScreen
    },
    [WALLET_ONBOARDING_BPAY_ROUTES.ACTIVATE_BPD_NEW]: {
      screen: ActivateBpdOnNewBPayScreen
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

export default PaymentMethodOnboardingBPayNavigator;
