import { StackNavigator } from "react-navigation";
import { AddCardScreen } from "../screens/wallet/AddCardScreen";
import { AddManagerToCardScreen } from "../screens/wallet/AddManagerToCardScreen";
import { AddPaymentMethodScreen } from "../screens/wallet/AddPaymentMethodScreen";
import ChoosePaymentMethodScreen from "../screens/wallet/ChoosePaymentMethodScreen";
import ConfirmSaveCardScreen from "../screens/wallet/ConfirmSaveCardScreen";
import ConfirmToProceedTransactionScreen from "../screens/wallet/ConfirmToProceedTransactionScreen";
import CreditCardsScreen from "../screens/wallet/CreditCardsScreen";
import { FirstTransactionSummaryScreen } from "../screens/wallet/FirstTransactionSummaryScreen";
import { ManuallyIdentifyTransactionScreen } from "../screens/wallet/ManuallyIdentifyTransactionScreen";
import { QRcodeAcquisitionByScannerScreen } from "../screens/wallet/QRcodeAcquisitionByScannerScreen";
import TransactionDetailsScreen from "../screens/wallet/TransactionDetailsScreen";
import TransactionsScreen from "../screens/wallet/TransactionsScreen";
import WalletHomeScreen from "../screens/wallet/WalletHomeScreen";
import { SafeNavigationScreenComponent } from "../types/redux_navigation";
import ROUTES from "./routes";

/**
 * TODO: migrate WALLET_TRANSACTION_SUMMARY on a new navigator for screens which does not visualize the footer menu.
 *   @https://www.pivotaltracker.com/n/projects/2048617/stories/158221096
 */
const WalletNavigator = StackNavigator(
  {
    [ROUTES.WALLET_HOME]: {
      screen: WalletHomeScreen as SafeNavigationScreenComponent<
        typeof WalletHomeScreen
      >
    },
    [ROUTES.WALLET_CREDITCARDS]: {
      screen: CreditCardsScreen as SafeNavigationScreenComponent<
        typeof CreditCardsScreen
      >
    },
    [ROUTES.WALLET_ADD_PAYMENT_METHOD]: {
      screen: AddPaymentMethodScreen as SafeNavigationScreenComponent<
        typeof AddPaymentMethodScreen
      >
    },
    [ROUTES.WALLET_TRANSACTION_DETAILS]: {
      screen: TransactionDetailsScreen as SafeNavigationScreenComponent<
        typeof TransactionDetailsScreen
      >
    },
    [ROUTES.WALLET_CARD_TRANSACTIONS]: {
      screen: TransactionsScreen as SafeNavigationScreenComponent<
        typeof TransactionsScreen
      >
    },
    [ROUTES.WALLET_ADD_CARD]: {
      screen: AddCardScreen as SafeNavigationScreenComponent<
        typeof AddCardScreen
      >
    },
    [ROUTES.WALLET_QRCODE_ACQUISITION_BY_SCANNER]: {
      screen: QRcodeAcquisitionByScannerScreen as SafeNavigationScreenComponent<
        typeof QRcodeAcquisitionByScannerScreen
      >
    },
    [ROUTES.WALLET_ADD_MANAGER]: {
      screen: AddManagerToCardScreen as SafeNavigationScreenComponent<
        typeof AddManagerToCardScreen
      >
    },
    [ROUTES.WALLET_CONFIRM_TO_PROCEED]: {
      screen: ConfirmToProceedTransactionScreen as SafeNavigationScreenComponent<
        typeof ConfirmToProceedTransactionScreen
      >
    },
    [ROUTES.WALLET_PAY_WITH]: {
      screen: ChoosePaymentMethodScreen as SafeNavigationScreenComponent<
        typeof ChoosePaymentMethodScreen
      >
    },
    [ROUTES.WALLET_FIRST_TRANSACTION_SUMMARY]: {
      screen: FirstTransactionSummaryScreen as SafeNavigationScreenComponent<
        typeof FirstTransactionSummaryScreen
      >
    },
    [ROUTES.WALLET_MANUAL_TRANSACTION_IDENTIFICATION]: {
      screen: ManuallyIdentifyTransactionScreen as SafeNavigationScreenComponent<
        typeof ManuallyIdentifyTransactionScreen
      >
    },
    [ROUTES.WALLET_ASK_SAVE_CARD]: {
      screen: ConfirmSaveCardScreen as SafeNavigationScreenComponent<
        typeof ConfirmSaveCardScreen
      >
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default WalletNavigator;
