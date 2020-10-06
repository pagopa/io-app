import { createStackNavigator } from "react-navigation";
import { SearchBankScreen } from "../screens/SearchBankScreen";
import WALLET_ADD_BANCOMAT_ROUTES from "./routes";

const PaymentMethodAddBancomatNavigator = createStackNavigator(
  {
    [WALLET_ADD_BANCOMAT_ROUTES.CHOOSE_BANK]: {
      screen: SearchBankScreen
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
