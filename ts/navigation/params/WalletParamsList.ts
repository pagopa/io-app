import BONUSVACANZE_ROUTES from "../../features/bonus/bonusVacanze/navigation/routes";
import { ActiveBonusScreenNavigationParams } from "../../features/bonus/bonusVacanze/screens/ActiveBonusScreen";
import BPD_ROUTES from "../../features/bonus/bpd/navigation/routes";
import { BancomatDetailScreenNavigationParams } from "../../features/wallet/bancomat/screen/BancomatDetailScreen";
import { BPayDetailScreenNavigationParams } from "../../features/wallet/bancomatpay/screen/BPayDetailScreen";
import { CobadgeDetailScreenNavigationParams } from "../../features/wallet/cobadge/screen/CobadgeDetailScreen";
import { CreditCardDetailScreenNavigationParams } from "../../features/wallet/creditCard/screen/CreditCardDetailScreen";
import WALLET_ONBOARDING_BANCOMAT_ROUTES from "../../features/wallet/onboarding/bancomat/navigation/routes";
import WALLET_ONBOARDING_BPAY_ROUTES from "../../features/wallet/onboarding/bancomatPay/navigation/routes";
import WALLET_ONBOARDING_COBADGE_ROUTES from "../../features/wallet/onboarding/cobadge/navigation/routes";
import { ActivateBpdOnNewCreditCardScreenNavigationParams } from "../../features/wallet/onboarding/common/screens/bpd/ActivateBpdOnNewCreditCardScreen";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "../../features/wallet/onboarding/privative/navigation/routes";
import WALLET_ONBOARDING_SATISPAY_ROUTES from "../../features/wallet/onboarding/satispay/navigation/routes";
import { PrivativeDetailScreenNavigationParams } from "../../features/wallet/privative/screen/PrivativeDetailScreen";
import { SatispayDetailScreenNavigationParams } from "../../features/wallet/satispay/screen/SatispayDetailScreen";
import { AddCardScreenNavigationParams } from "../../screens/wallet/AddCardScreen";
import { AddCreditCardOutcomeCodeMessageNavigationParams } from "../../screens/wallet/AddCreditCardOutcomeCodeMessage";
import { AddPaymentMethodScreenNavigationParams } from "../../screens/wallet/AddPaymentMethodScreen";
import { ConfirmCardDetailsScreenNavigationParams } from "../../screens/wallet/ConfirmCardDetailsScreen";
import { CreditCardOnboardingAttemptDetailScreenNavigationParams } from "../../screens/wallet/creditCardOnboardingAttempts/CreditCardOnboardingAttemptDetailScreen";
import { ConfirmPaymentMethodScreenNavigationParams } from "../../screens/wallet/payment/ConfirmPaymentMethodScreen";
import { ManualDataInsertionScreenNavigationParams } from "../../screens/wallet/payment/ManualDataInsertionScreen";
import { PaymentOutcomeCodeMessageNavigationParams } from "../../screens/wallet/payment/PaymentOutcomeCodeMessage";
import { PickPaymentMethodScreenNavigationParams } from "../../screens/wallet/payment/PickPaymentMethodScreen";
import { PickPspScreenNavigationParams } from "../../screens/wallet/payment/PickPspScreen";
import { TransactionErrorScreenNavigationParams } from "../../screens/wallet/payment/TransactionErrorScreen";
import { TransactionSummaryScreenNavigationParams } from "../../screens/wallet/payment/TransactionSummaryScreen";
import { PaymentHistoryDetailsScreenNavigationParams } from "../../screens/wallet/PaymentHistoryDetailsScreen";
import { TransactionDetailsScreenNavigationParams } from "../../screens/wallet/TransactionDetailsScreen";
import { WalletHomeNavigationParams } from "../../screens/wallet/WalletHomeScreen";
import ROUTES from "../routes";

export type WalletParamsList = {
  [ROUTES.WALLET_HOME]: WalletHomeNavigationParams;
  [ROUTES.WALLET_ADD_PAYMENT_METHOD]: AddPaymentMethodScreenNavigationParams;
  [ROUTES.WALLET_TRANSACTION_DETAILS]: TransactionDetailsScreenNavigationParams;
  [ROUTES.WALLET_CREDIT_CARD_DETAIL]: CreditCardDetailScreenNavigationParams;
  [ROUTES.WALLET_BANCOMAT_DETAIL]: BancomatDetailScreenNavigationParams;
  [ROUTES.WALLET_SATISPAY_DETAIL]: SatispayDetailScreenNavigationParams;
  [ROUTES.WALLET_PAYPAL_DETAIL]: undefined;
  [ROUTES.WALLET_BPAY_DETAIL]: BPayDetailScreenNavigationParams;
  [ROUTES.WALLET_COBADGE_DETAIL]: CobadgeDetailScreenNavigationParams;
  [ROUTES.WALLET_PRIVATIVE_DETAIL]: PrivativeDetailScreenNavigationParams;
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

  // TODO: [ROUTES.MAIN]: NavigatorScreenParams<BonusVacanzeParamsList>
  [BONUSVACANZE_ROUTES.BONUS_ACTIVE_DETAIL_SCREEN]: ActiveBonusScreenNavigationParams;

  // TODO: [BPD_ROUTES.ONBOARDING.MAIN]: NavigatorScreenParams<BpdOnboardingParamsList>
  // TODO: [BPD_ROUTES.DETAILS_MAIN.MAIN]: NavigatorScreenParams<BpdDetailsParamsList>
  [BPD_ROUTES.CTA_BPD_IBAN_EDIT]: undefined;

  // TODO: [WALLET_ONBOARDING_BANCOMAT_ROUTES.MAIN]: NavigatorScreenParams<WalletAddBancomatParamsList>
  // TODO: [WALLET_ONBOARDING_SATISPAY_ROUTES.MAIN]: NavigatorScreenParams<PaymentMethodOnboardingSatispayParamsList>
  // TODO: [WALLET_ONBOARDING_BPAY_ROUTES.MAIN]: NavigatorScreenParams<PaymentMethodOnboardingBPayParamsList>
  // TODO: [WALLET_ONBOARDING_COBADGE_ROUTES.MAIN]: NavigatorScreenParams<PaymentMethodOnboardingCoBadgeParamsList>
  // TODO: [WALLET_ONBOARDING_PRIVATIVE_ROUTES.MAIN]: NavigatorScreenParams<PaymentMethodOnboardingPrivativeParamsList>

  [WALLET_ONBOARDING_BANCOMAT_ROUTES.ACTIVATE_BPD_NEW_CREDIT_CARD]: ActivateBpdOnNewCreditCardScreenNavigationParams;
  [WALLET_ONBOARDING_BANCOMAT_ROUTES.ACTIVATE_BPD_NEW_BANCOMAT]: undefined;
  [WALLET_ONBOARDING_SATISPAY_ROUTES.ACTIVATE_BPD_NEW_SATISPAY]: undefined;
  [WALLET_ONBOARDING_BPAY_ROUTES.ACTIVATE_BPD_NEW]: undefined;
  [WALLET_ONBOARDING_COBADGE_ROUTES.ACTIVATE_BPD_NEW]: undefined;
  [WALLET_ONBOARDING_PRIVATIVE_ROUTES.ACTIVATE_BPD_NEW]: undefined;
};
