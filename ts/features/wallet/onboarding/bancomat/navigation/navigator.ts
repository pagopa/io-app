import { createStackNavigator } from "react-navigation";
import SuggestBpdActivationScreen from "../../common/screens/bpd/SuggestBpdActivationScreen";
import BancomatSearchStartScreen from "../screens/search/BancomatSearchStartScreen";
import SearchBankScreen from "../screens/search/SearchBankScreen";
import SearchAvailableUserBancomatScreen from "../screens/searchBancomat/SearchAvailableUserBancomatScreen";
import { ActivateBpdOnNewCreditCardScreen } from "../../common/screens/bpd/ActivateBpdOnNewCreditCardScreen";
import ActivateBpdOnNewBancomatScreen from "../screens/ActivateBpdOnNewBancomatScreen";
import WALLET_ONBOARDING_BANCOMAT_ROUTES from "./routes";

const PaymentMethodOnboardingBancomatNavigator = createStackNavigator(
  {
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.CHOOSE_BANK_INFO]: {
      screen: BancomatSearchStartScreen
    },
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.CHOOSE_BANK]: {
      screen: SearchBankScreen
    },
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.SEARCH_AVAILABLE_USER_BANCOMAT]: {
      screen: SearchAvailableUserBancomatScreen
    },
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.SUGGEST_BPD_ACTIVATION]: {
      screen: SuggestBpdActivationScreen
    },
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.ACTIVATE_BPD_NEW_BANCOMAT]: {
      screen: ActivateBpdOnNewBancomatScreen
    },
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.ACTIVATE_BPD_NEW_CREDIT_CARD]: {
      screen: ActivateBpdOnNewCreditCardScreen
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
