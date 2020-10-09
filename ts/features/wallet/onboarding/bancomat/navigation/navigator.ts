import { createStackNavigator } from "react-navigation";
import TMPSearchBankScreen from "../screens/TMPSearchBankScreen";
import TMPUserAddBancomatToWallet from "../screens/TMPUserAddBancomatToWallet";
import WALLET_ONBOARDING_BANCOMAT_ROUTES from "./routes";

const PaymentMethodOnboardingBancomatNavigator = createStackNavigator(
  {
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.CHOOSE_BANK]: {
      screen: TMPSearchBankScreen
    },
    [WALLET_ONBOARDING_BANCOMAT_ROUTES.SEARCH_AVAILABLE_USER_BANCOMAT]: {
      screen: TMPUserAddBancomatToWallet
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
