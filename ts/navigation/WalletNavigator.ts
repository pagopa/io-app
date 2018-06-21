import { StackNavigator } from "react-navigation";
import IngressScren from "../screens/IngressScreen";
import { AddPaymentMethodScreen } from "../screens/wallet/AddPaymentMethodScreen";
import CreditCardsScreen from "../screens/wallet/CreditCardsScreen";
import { FirstTransactionSummaryScreen } from "../screens/wallet/FirstTransactionSummaryScreen";
import { ManuallyIdentifyTransactionScreen } from "../screens/wallet/ManuallyIdentifyTransactionScreen";
import TransactionDetailsScreen from "../screens/wallet/TransactionDetailsScreen";
import TransactionsScreen from "../screens/wallet/TransactionsScreen";
import ROUTES from "./routes";

/**
 * TODO: migrate WALLET_TRANSACTION_SUMMARY on a new navigator for screens which does not visualize the footer menu.
 *   - https://www.pivotaltracker.com/n/projects/2048617/stories/158221096
 */
const WalletNavigator = StackNavigator(
  {
    [ROUTES.WALLET_HOME]: {
      screen: IngressScren
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
    [ROUTES.WALLET_FIRST_TRANSACTION_SUMMARY]: {
      screen: FirstTransactionSummaryScreen
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
