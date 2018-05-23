import { StackNavigator } from "react-navigation";
import { CreditCardsScreen } from "../screens/wallet/CreditCardsScreen";
import { WalletHomeScreen } from "../screens/wallet/WalletHomeScreen";
import ROUTES from "./routes";
import { TransactionsScreen } from '../screens/wallet/TransactionsScreen';

const WalletNavigator = StackNavigator(
  {
    [ROUTES.WALLET_HOME]: {
      screen: WalletHomeScreen
    },
    [ROUTES.WALLET_CREDITCARDS]: {
      screen: CreditCardsScreen
    },
    [ROUTES.WALLET_CARD_TRANSACTIONS]: {
      screen: TransactionsScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default WalletNavigator;
