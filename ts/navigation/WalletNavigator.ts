import { createStackNavigator } from "react-navigation";
import { AddCardScreen } from "../screens/wallet/AddCardScreen";
import { AddManagerToCardScreen } from "../screens/wallet/AddManagerToCardScreen";
import { AddPaymentMethodScreen } from "../screens/wallet/AddPaymentMethodScreen";
import ConfirmSaveCardScreen from "../screens/wallet/ConfirmSaveCardScreen";
import ConfirmPaymentMethodScreen from "../screens/wallet/payment/ConfirmPaymentMethodScreen";
import ManualDataInsertionScreen from "../screens/wallet/payment/ManualDataInsertionScreen";
import PickPaymentMethodScreen from "../screens/wallet/payment/PickPaymentMethodScreen";
import ScanQRCodeScreen from "../screens/wallet/payment/ScanQRCodeScreen";
import TextVerificationScreen from "../screens/wallet/payment/TextVerificationScreen";
import TransactionSummaryScreen from "../screens/wallet/payment/TransactionSummaryScreen";
import TransactionDetailsScreen from "../screens/wallet/TransactionDetailsScreen";
import TransactionsScreen from "../screens/wallet/TransactionsScreen";
import WalletHomeScreen from "../screens/wallet/WalletHomeScreen";
import WalletsScreen from "../screens/wallet/WalletsScreen";
import ROUTES from "./routes";

/**
 * TODO: migrate WALLET_TRANSACTION_SUMMARY on a new navigator for screens which does not visualize the footer menu.
 *   @https://www.pivotaltracker.com/n/projects/2048617/stories/158221096
 */
const WalletNavigator = createStackNavigator(
  {
    [ROUTES.WALLET_HOME]: {
      screen: WalletHomeScreen
    },
    [ROUTES.WALLET_LIST]: {
      screen: WalletsScreen
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
    [ROUTES.WALLET_ADD_CARD]: {
      screen: AddCardScreen
    },
    [ROUTES.WALLET_ADD_MANAGER]: {
      screen: AddManagerToCardScreen
    },
    [ROUTES.WALLET_ASK_SAVE_CARD]: {
      screen: ConfirmSaveCardScreen
    },
    [ROUTES.PAYMENT_SCAN_QR_CODE]: {
      screen: ScanQRCodeScreen
    },
    [ROUTES.PAYMENT_MANUAL_DATA_INSERTION]: {
      screen: ManualDataInsertionScreen
    },
    [ROUTES.PAYMENT_TRANSACTION_SUMMARY]: {
      screen: TransactionSummaryScreen
    },
    [ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD]: {
      screen: ConfirmPaymentMethodScreen
    },
    [ROUTES.PAYMENT_PICK_PAYMENT_METHOD]: {
      screen: PickPaymentMethodScreen
    },
    [ROUTES.PAYMENT_TEXT_VERIFICATION]: {
      screen: TextVerificationScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default WalletNavigator;
