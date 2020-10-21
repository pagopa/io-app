import { createStackNavigator } from "react-navigation";
import AskBpdActivationScreen from "../screens/bpd/AskBpdActivationScreen";
import SearchBankScreen from "../screens/search/SearchBankScreen";
import SearchAvailableUserBancomatScreen from "../screens/searchBancomat/SearchAvailableUserBancomatScreen";
import WALLET_ONBOARDING_BANCOMAT_ROUTES from "./routes";

const PaymentMethodOnboardingBancomatNavigator = createStackNavigator(
  {
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.CHOOSE_BANK]: {
      screen: SearchBankScreen
    },
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.SEARCH_AVAILABLE_USER_BANCOMAT]: {
      screen: SearchAvailableUserBancomatScreen
    },
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.ASK_BPD_ACTIVATION]: {
      screen: AskBpdActivationScreen
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

export default PaymentMethodOnboardingBancomatNavigator;
