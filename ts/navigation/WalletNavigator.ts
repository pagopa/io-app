import { StackNavigator } from "react-navigation";
import { AddPaymentMethodScreen } from "../screens/wallet/AddPaymentMethodScreen";
import { ChoosePaymentMethodScreen } from "../screens/wallet/ChoosePaymentMethodScreen";
import { ConfirmToProceedTransactionScreen } from "../screens/wallet/ConfirmToProceedTransactionScreen";
import { CreditCardsScreen } from "../screens/wallet/CreditCardsScreen";
import TransactionDetailsScreen from "../screens/wallet/TransactionDetailsScreen";
import TransactionsScreen from "../screens/wallet/TransactionsScreen";
import WalletHomeScreen from "../screens/wallet/WalletHomeScreen";
import ROUTES from "./routes";

/**
 * TODO: migrate WALLET_TRANSACTION_SUMMARY on a new navigator for screens which does not visualize the footer menu.
 *   @https://www.pivotaltracker.com/n/projects/2048617/stories/158221096
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
    [ROUTES.WALLET_CONFIRM_TO_PROCEED]: {
      screen: ConfirmToProceedTransactionScreen
    },
    [ROUTES.WALLET_PAY_WITH]: {
      screen: ChoosePaymentMethodScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default WalletNavigator;
