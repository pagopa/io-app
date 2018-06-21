import { StackNavigator } from "react-navigation";
import { AddManagerToCardScreen } from "../screens/wallet/AddManagerToCardScreen";
import { AddPaymentMethodScreen } from "../screens/wallet/AddPaymentMethodScreen";
import CreditCardsScreen from "../screens/wallet/CreditCardsScreen";
import { ManuallyIdentifyTransactionScreen } from "../screens/wallet/ManuallyIdentifyTransactionScreen";
import { TransactionDetailsScreen } from "../screens/wallet/TransactionDetailsScreen";
import TransactionsScreen from "../screens/wallet/TransactionsScreen";
import WalletHomeScreen from "../screens/wallet/WalletHomeScreen";
import ROUTES from "./routes";

/**
 * TODO: Add the screen AddManagerToCardScreen to the proper navigator
 *      @https://www.pivotaltracker.com/n/projects/2048617/stories/158221096
 */
const WalletNavigator = StackNavigator(
  {
    [ROUTES.WALLET_HOME]: {
      screen: WalletHomeScreen
    },
    [ROUTES.WALLET_CREDITCARDS]: {
      screen: CreditCardsScreen
    },
    [ROUTES.WALLET_ADD_PAYMENT_METHOD]: {
      screen: AddPaymentMethodScreen
    },
    [ROUTES.WALLET_TRANSACTION_DETAILS]: {
      screen: TransactionDetailsScreen
    },
    [ROUTES.WALLET_CARD_TRANSACTIONS]: {
      screen: TransactionsScreen
    },
    [ROUTES.WALLET_ADD_MANAGER]: {
      screen: AddManagerToCardScreen
    },
    [ROUTES.WALLET_MANUAL_TRANSACTION_IDENTIFICATION]: {
      screen: ManuallyIdentifyTransactionScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default WalletNavigator;
