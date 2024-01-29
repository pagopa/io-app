import { NavigatorScreenParams } from "@react-navigation/native";
import { IdPayInstrumentInitiativesScreenRouteParams } from "../../features/idpay/wallet/screens/IdPayInstrumentInitiativesScreen";
import { BancomatDetailScreenNavigationParams } from "../../features/wallet/bancomat/screen/BancomatDetailScreen";
import { BPayDetailScreenNavigationParams } from "../../features/wallet/bancomatpay/screen/BPayDetailScreen";
import { CobadgeDetailScreenNavigationParams } from "../../features/wallet/cobadge/screen/CobadgeDetailScreen";
import { CreditCardDetailScreenNavigationParams } from "../../features/wallet/creditCard/screen/CreditCardDetailScreen";
import { PaymentMethodOnboardingBPayParamsList } from "../../features/wallet/onboarding/bancomatPay/navigation/params";
import WALLET_ONBOARDING_BPAY_ROUTES from "../../features/wallet/onboarding/bancomatPay/navigation/routes";
import { PaymentMethodOnboardingCoBadgeParamsList } from "../../features/wallet/onboarding/cobadge/navigation/params";
import WALLET_ONBOARDING_COBADGE_ROUTES from "../../features/wallet/onboarding/cobadge/navigation/routes";
import { PaymentMethodOnboardingPayPalParamsList } from "../../features/wallet/onboarding/paypal/navigation/params";
import PAYPAL_ROUTES from "../../features/wallet/onboarding/paypal/navigation/routes";
import { PayPalPspUpdateScreenNavigationParams } from "../../features/wallet/paypal/screen/PayPalPspUpdateScreen";
import { AddCardScreenNavigationParams } from "../../screens/wallet/AddCardScreen";
import { AddCreditCardOutcomeCodeMessageNavigationParams } from "../../screens/wallet/AddCreditCardOutcomeCodeMessage";
import { AddPaymentMethodScreenNavigationParams } from "../../screens/wallet/AddPaymentMethodScreen";
import { ConfirmCardDetailsScreenNavigationParams } from "../../screens/wallet/ConfirmCardDetailsScreen";
import { PaymentHistoryDetailsScreenNavigationParams } from "../../screens/wallet/PaymentHistoryDetailsScreen";
import { TransactionDetailsScreenNavigationParams } from "../../screens/wallet/TransactionDetailsScreen";
import { CreditCardOnboardingAttemptDetailScreenNavigationParams } from "../../screens/wallet/creditCardOnboardingAttempts/CreditCardOnboardingAttemptDetailScreen";
import { ConfirmPaymentMethodScreenNavigationParams } from "../../screens/wallet/payment/ConfirmPaymentMethodScreen";
import { ManualDataInsertionScreenNavigationParams } from "../../screens/wallet/payment/ManualDataInsertionScreen";
import { PaymentOutcomeCodeMessageNavigationParams } from "../../screens/wallet/payment/PaymentOutcomeCodeMessage";
import { PickPaymentMethodScreenNavigationParams } from "../../screens/wallet/payment/PickPaymentMethodScreen";
import { PickPspScreenNavigationParams } from "../../screens/wallet/payment/PickPspScreen";
import { TransactionErrorScreenNavigationParams } from "../../screens/wallet/payment/TransactionErrorScreen";
import { TransactionSummaryScreenNavigationParams } from "../../screens/wallet/payment/TransactionSummaryScreen";
import ROUTES from "../routes";
import { BONUS_ROUTES } from "../../features/bonus/common/navigation/navigator";

export type WalletParamsList = {
  [ROUTES.WALLET_IDPAY_INITIATIVE_LIST]: IdPayInstrumentInitiativesScreenRouteParams;
  [ROUTES.WALLET_ADD_PAYMENT_METHOD]: AddPaymentMethodScreenNavigationParams;
  [ROUTES.WALLET_TRANSACTION_DETAILS]: TransactionDetailsScreenNavigationParams;
  [ROUTES.WALLET_CREDIT_CARD_DETAIL]: CreditCardDetailScreenNavigationParams;
  [ROUTES.WALLET_BANCOMAT_DETAIL]: BancomatDetailScreenNavigationParams;
  [ROUTES.WALLET_PAYPAL_DETAIL]: undefined;
  [ROUTES.WALLET_PAYPAL_UPDATE_PAYMENT_PSP]: PayPalPspUpdateScreenNavigationParams;
  [ROUTES.WALLET_BPAY_DETAIL]: BPayDetailScreenNavigationParams;
  [ROUTES.WALLET_COBADGE_DETAIL]: CobadgeDetailScreenNavigationParams;
  [ROUTES.WALLET_ADD_CARD]: AddCardScreenNavigationParams;
  [ROUTES.WALLET_CONFIRM_CARD_DETAILS]: ConfirmCardDetailsScreenNavigationParams;
  [ROUTES.PAYMENT_SCAN_QR_CODE]: undefined;
  [ROUTES.PAYMENT_MANUAL_DATA_INSERTION]: ManualDataInsertionScreenNavigationParams;
  [ROUTES.PAYMENT_TRANSACTION_SUMMARY]: TransactionSummaryScreenNavigationParams;
  [ROUTES.PAYMENT_TRANSACTION_ERROR]: TransactionErrorScreenNavigationParams;
  [ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD]: ConfirmPaymentMethodScreenNavigationParams;
  [ROUTES.PAYMENT_PICK_PSP]: PickPspScreenNavigationParams;
  [ROUTES.PAYMENT_PICK_PAYMENT_METHOD]: PickPaymentMethodScreenNavigationParams;
  [ROUTES.PAYMENTS_HISTORY_SCREEN]: undefined;
  [ROUTES.PAYMENT_HISTORY_DETAIL_INFO]: PaymentHistoryDetailsScreenNavigationParams;
  [ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPTS_SCREEN]: undefined;
  [ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPT_DETAIL]: CreditCardOnboardingAttemptDetailScreenNavigationParams;
  [ROUTES.ADD_CREDIT_CARD_OUTCOMECODE_MESSAGE]: AddCreditCardOutcomeCodeMessageNavigationParams;
  [ROUTES.PAYMENT_OUTCOMECODE_MESSAGE]: PaymentOutcomeCodeMessageNavigationParams;

  [BONUS_ROUTES.MAIN]: undefined;

  [WALLET_ONBOARDING_BPAY_ROUTES.MAIN]: NavigatorScreenParams<PaymentMethodOnboardingBPayParamsList>;
  [WALLET_ONBOARDING_COBADGE_ROUTES.MAIN]: NavigatorScreenParams<PaymentMethodOnboardingCoBadgeParamsList>;
  [PAYPAL_ROUTES.ONBOARDING
    .MAIN]: NavigatorScreenParams<PaymentMethodOnboardingPayPalParamsList>;

  [WALLET_ONBOARDING_BPAY_ROUTES.ACTIVATE_BPD_NEW]: undefined;
  [WALLET_ONBOARDING_COBADGE_ROUTES.ACTIVATE_BPD_NEW]: undefined;
};
