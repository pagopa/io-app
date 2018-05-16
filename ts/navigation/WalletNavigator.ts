import { StackNavigator } from "react-navigation";
import { CreditCardsScreen } from "../screens/wallet/CreditCardsScreen";
import { WalletHomeScreen } from "../screens/wallet/WalletHomeScreen";
import ROUTES from "./routes";

const PortfolioNavigator = StackNavigator({
  [ROUTES.WALLET_HOME]: {
    screen: WalletHomeScreen
  },
  [ROUTES.WALLET_CREDITCARDS]: {
    screen: CreditCardsScreen
  },
});

export default PortfolioNavigator;
