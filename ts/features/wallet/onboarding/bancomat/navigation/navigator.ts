import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import SuggestBpdActivationScreen from "../../common/screens/bpd/SuggestBpdActivationScreen";
import BancomatSearchBankScreen from "../screens/search/BancomatSearchBankScreen";
import BancomatSearchStartScreen from "../screens/search/BancomatSearchStartScreen";
import SearchAvailableUserBancomatScreen from "../screens/searchBancomat/SearchAvailableUserBancomatScreen";
import WALLET_ONBOARDING_BANCOMAT_ROUTES from "./routes";

const PaymentMethodOnboardingBancomatNavigator = createCompatNavigatorFactory(
  createStackNavigator
)(
  {
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.BANCOMAT_START]: {
      screen: BancomatSearchStartScreen
    },
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.CHOOSE_BANK]: {
      screen: BancomatSearchBankScreen
    },
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.SEARCH_AVAILABLE_USER_BANCOMAT]: {
      screen: SearchAvailableUserBancomatScreen
    },
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.SUGGEST_BPD_ACTIVATION]: {
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

export default PaymentMethodOnboardingBancomatNavigator;
