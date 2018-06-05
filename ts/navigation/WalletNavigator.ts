import { StackNavigator } from "react-navigation";
import { AddPaymentMethodScreen } from "../screens/wallet/AddPaymentMethodScreen";
import { CreditCardsScreen } from "../screens/wallet/CreditCardsScreen";
import { QRcodeAcquisitionByScannerScreen } from "../screens/wallet/QRcodeAcquisitionByScannerScreen";
import { TransactionDetailsScreen } from "../screens/wallet/TransactionDetailsScreen";
import { TransactionsScreen } from "../screens/wallet/TransactionsScreen";
import { WalletHomeScreen } from "../screens/wallet/WalletHomeScreen";
import ROUTES from "./routes";

/**
 * TODO: create a generic navigator which does not implement the menu as footer. It should be used for
 * QRcodeAcquisitionByScannerScreen
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
    [ROUTES.WALLET_QRCODE_ACQUISITION_BY_SCANNER]: {
      screen: QRcodeAcquisitionByScannerScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default WalletNavigator;
