import { createStackNavigator } from "react-navigation";
import SearchBancomatScreen from "../screens/searchBancomat/SearchAvailableUserBancomatScreen";
import TMPSearchBankScreen from "../screens/TMPSearchBankScreen";
import WALLET_ADD_BANCOMAT_ROUTES from "./routes";

const PaymentMethodAddBancomatNavigator = createStackNavigator(
  {
    [WALLET_ADD_BANCOMAT_ROUTES.CHOOSE_BANK]: {
      screen: TMPSearchBankScreen
    },
    [WALLET_ADD_BANCOMAT_ROUTES.SEARCH_AVAILABLE_USER_BANCOMAT]: {
      screen: SearchBancomatScreen
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

export default PaymentMethodAddBancomatNavigator;
