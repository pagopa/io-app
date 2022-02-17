import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import {
  bonusVacanzeEnabled,
  bpdEnabled,
  bpdOptInPaymentMethodsEnabled
} from "../config";
import BonusVacanzeNavigator from "../features/bonus/bonusVacanze/navigation/navigator";
import BONUSVACANZE_ROUTES from "../features/bonus/bonusVacanze/navigation/routes";
import ActiveBonusScreen from "../features/bonus/bonusVacanze/screens/ActiveBonusScreen";
import {
  BpdDetailsNavigator,
  BpdIBANNavigator,
  BpdOnboardingNavigator,
  OptInPaymentMethodNavigator
} from "../features/bonus/bpd/navigation/navigator";
import BPD_ROUTES from "../features/bonus/bpd/navigation/routes";
import IbanCTAEditScreen from "../features/bonus/bpd/screens/iban/IbanCTAEditScreen";
import BancomatDetailScreen from "../features/wallet/bancomat/screen/BancomatDetailScreen";
import BPayDetailScreen from "../features/wallet/bancomatpay/screen/BPayDetailScreen";
import CobadgeDetailScreen from "../features/wallet/cobadge/screen/CobadgeDetailScreen";
import CreditCardDetailScreen from "../features/wallet/creditCard/screen/CreditCardDetailScreen";
import WalletAddBancomatNavigator from "../features/wallet/onboarding/bancomat/navigation/navigator";
import WALLET_ONBOARDING_BANCOMAT_ROUTES from "../features/wallet/onboarding/bancomat/navigation/routes";
import ActivateBpdOnNewBancomatScreen from "../features/wallet/onboarding/bancomat/screens/ActivateBpdOnNewBancomatScreen";
import PaymentMethodOnboardingBPayNavigator from "../features/wallet/onboarding/bancomatPay/navigation/navigator";
import WALLET_ONBOARDING_BPAY_ROUTES from "../features/wallet/onboarding/bancomatPay/navigation/routes";
import ActivateBpdOnNewBPayScreen from "../features/wallet/onboarding/bancomatPay/screens/ActivateBpdOnNewBPayScreen";
import PaymentMethodOnboardingCoBadgeNavigator from "../features/wallet/onboarding/cobadge/navigation/navigator";
import WALLET_ONBOARDING_COBADGE_ROUTES from "../features/wallet/onboarding/cobadge/navigation/routes";
import ActivateBpdOnNewCoBadgeScreen from "../features/wallet/onboarding/cobadge/screens/ActivateBpdOnNewCoBadgeScreen";
import { ActivateBpdOnNewCreditCardScreen } from "../features/wallet/onboarding/common/screens/bpd/ActivateBpdOnNewCreditCardScreen";
import { PaymentMethodOnboardingPayPalOnboardingNavigator } from "../features/wallet/onboarding/paypal/navigation/navigator";
import PAYPAL_ROUTES from "../features/wallet/onboarding/paypal/navigation/routes";
import PaymentMethodOnboardingPrivativeNavigator from "../features/wallet/onboarding/privative/navigation/navigator";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "../features/wallet/onboarding/privative/navigation/routes";
import ActivateBpdOnNewPrivativeScreen from "../features/wallet/onboarding/privative/screens/ActivateBpdOnNewPrivativeScreen";
import PaymentMethodOnboardingSatispayNavigator from "../features/wallet/onboarding/satispay/navigation/navigator";
import WALLET_ONBOARDING_SATISPAY_ROUTES from "../features/wallet/onboarding/satispay/navigation/routes";
import ActivateBpdOnNewSatispayScreen from "../features/wallet/onboarding/satispay/screens/ActivateBpdOnNewSatispayScreen";
import PaypalDetailScreen from "../features/wallet/paypal/screen/PaypalDetailScreen";
import PrivativeDetailScreen from "../features/wallet/privative/screen/PrivativeDetailScreen";
import SatispayDetailScreen from "../features/wallet/satispay/screen/SatispayDetailScreen";
import AddCardScreen from "../screens/wallet/AddCardScreen";
import AddCreditCardOutcomeCodeMessage from "../screens/wallet/AddCreditCardOutcomeCodeMessage";
import AddPaymentMethodScreen from "../screens/wallet/AddPaymentMethodScreen";
import ConfirmCardDetailsScreen from "../screens/wallet/ConfirmCardDetailsScreen";
import CreditCardOnboardingAttemptDetailScreen from "../screens/wallet/creditCardOnboardingAttempts/CreditCardOnboardingAttemptDetailScreen";
import CreditCardOnboardingAttemptsScreen from "../screens/wallet/creditCardOnboardingAttempts/CreditCardOnboardingAttemptsScreen";
import ConfirmPaymentMethodScreen from "../screens/wallet/payment/ConfirmPaymentMethodScreen";
import ManualDataInsertionScreen from "../screens/wallet/payment/ManualDataInsertionScreen";
import PaymentOutcomeCodeMessage from "../screens/wallet/payment/PaymentOutcomeCodeMessage";
import PickPaymentMethodScreen from "../screens/wallet/payment/PickPaymentMethodScreen";
import PickPspScreen from "../screens/wallet/payment/PickPspScreen";
import ScanQrCodeScreen from "../screens/wallet/payment/ScanQrCodeScreen";
import TransactionErrorScreen from "../screens/wallet/payment/TransactionErrorScreen";
import TransactionSummaryScreen from "../screens/wallet/payment/TransactionSummaryScreen";
import PaymentHistoryDetailsScreen from "../screens/wallet/PaymentHistoryDetailsScreen";
import PaymentsHistoryScreen from "../screens/wallet/PaymentsHistoryScreen";
import TransactionDetailsScreen from "../screens/wallet/TransactionDetailsScreen";
import WalletHomeScreen from "../screens/wallet/WalletHomeScreen";
import ROUTES from "./routes";

const baseRouteConfigMap = {
  [ROUTES.WALLET_HOME]: {
    screen: WalletHomeScreen
  },
  [ROUTES.WALLET_ADD_PAYMENT_METHOD]: {
    screen: AddPaymentMethodScreen
  },
  [ROUTES.WALLET_TRANSACTION_DETAILS]: {
    screen: TransactionDetailsScreen
  },
  [ROUTES.WALLET_CREDIT_CARD_DETAIL]: {
    screen: CreditCardDetailScreen
  },
  [ROUTES.WALLET_BANCOMAT_DETAIL]: {
    screen: BancomatDetailScreen
  },
  [ROUTES.WALLET_SATISPAY_DETAIL]: {
    screen: SatispayDetailScreen
  },
  [ROUTES.WALLET_PAYPAL_DETAIL]: {
    screen: PaypalDetailScreen
  },
  [ROUTES.WALLET_BPAY_DETAIL]: {
    screen: BPayDetailScreen
  },
  [ROUTES.WALLET_COBADGE_DETAIL]: {
    screen: CobadgeDetailScreen
  },
  [ROUTES.WALLET_PRIVATIVE_DETAIL]: {
    screen: PrivativeDetailScreen
  },
  [ROUTES.WALLET_ADD_CARD]: {
    screen: AddCardScreen
  },
  [ROUTES.WALLET_CONFIRM_CARD_DETAILS]: {
    screen: ConfirmCardDetailsScreen
  },
  [ROUTES.PAYMENT_SCAN_QR_CODE]: {
    screen: ScanQrCodeScreen
  },
  [ROUTES.PAYMENT_MANUAL_DATA_INSERTION]: {
    screen: ManualDataInsertionScreen
  },
  [ROUTES.PAYMENT_TRANSACTION_SUMMARY]: {
    screen: TransactionSummaryScreen
  },
  [ROUTES.PAYMENT_TRANSACTION_ERROR]: {
    screen: TransactionErrorScreen
  },
  [ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD]: {
    screen: ConfirmPaymentMethodScreen
  },
  [ROUTES.PAYMENT_PICK_PSP]: {
    screen: PickPspScreen
  },
  [ROUTES.PAYMENT_PICK_PAYMENT_METHOD]: {
    screen: PickPaymentMethodScreen
  },
  [ROUTES.PAYMENTS_HISTORY_SCREEN]: {
    screen: PaymentsHistoryScreen
  },
  [ROUTES.PAYMENT_HISTORY_DETAIL_INFO]: {
    screen: PaymentHistoryDetailsScreen
  },
  [ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPTS_SCREEN]: {
    screen: CreditCardOnboardingAttemptsScreen
  },
  [ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPT_DETAIL]: {
    screen: CreditCardOnboardingAttemptDetailScreen
  },
  [ROUTES.ADD_CREDIT_CARD_OUTCOMECODE_MESSAGE]: {
    screen: AddCreditCardOutcomeCodeMessage
  },
  [ROUTES.PAYMENT_OUTCOMECODE_MESSAGE]: {
    screen: PaymentOutcomeCodeMessage
  }
};

const bonusVacanzeConfigMap = {
  [BONUSVACANZE_ROUTES.MAIN]: {
    screen: BonusVacanzeNavigator
  },
  [BONUSVACANZE_ROUTES.BONUS_ACTIVE_DETAIL_SCREEN]: {
    screen: ActiveBonusScreen
  }
};

const bpdConfigMap = {
  [BPD_ROUTES.ONBOARDING.MAIN]: {
    screen: BpdOnboardingNavigator
  },
  [BPD_ROUTES.IBAN_MAIN]: {
    screen: BpdIBANNavigator
  },
  [BPD_ROUTES.DETAILS_MAIN]: {
    screen: BpdDetailsNavigator
  },
  [BPD_ROUTES.CTA_BPD_IBAN_EDIT]: {
    screen: IbanCTAEditScreen
  },
  [WALLET_ONBOARDING_BANCOMAT_ROUTES.ACTIVATE_BPD_NEW_CREDIT_CARD]: {
    screen: ActivateBpdOnNewCreditCardScreen
  },
  [WALLET_ONBOARDING_BANCOMAT_ROUTES.MAIN]: {
    screen: WalletAddBancomatNavigator
  },
  [WALLET_ONBOARDING_BANCOMAT_ROUTES.ACTIVATE_BPD_NEW_BANCOMAT]: {
    screen: ActivateBpdOnNewBancomatScreen
  },
  [WALLET_ONBOARDING_SATISPAY_ROUTES.MAIN]: {
    screen: PaymentMethodOnboardingSatispayNavigator
  },
  [WALLET_ONBOARDING_SATISPAY_ROUTES.ACTIVATE_BPD_NEW_SATISPAY]: {
    screen: ActivateBpdOnNewSatispayScreen
  },
  [WALLET_ONBOARDING_BPAY_ROUTES.MAIN]: {
    screen: PaymentMethodOnboardingBPayNavigator
  },
  [WALLET_ONBOARDING_BPAY_ROUTES.ACTIVATE_BPD_NEW]: {
    screen: ActivateBpdOnNewBPayScreen
  },
  [WALLET_ONBOARDING_COBADGE_ROUTES.MAIN]: {
    screen: PaymentMethodOnboardingCoBadgeNavigator
  },
  [WALLET_ONBOARDING_COBADGE_ROUTES.ACTIVATE_BPD_NEW]: {
    screen: ActivateBpdOnNewCoBadgeScreen
  },
  [WALLET_ONBOARDING_PRIVATIVE_ROUTES.MAIN]: {
    screen: PaymentMethodOnboardingPrivativeNavigator
  },
  [WALLET_ONBOARDING_PRIVATIVE_ROUTES.ACTIVATE_BPD_NEW]: {
    screen: ActivateBpdOnNewPrivativeScreen
  }
};

const paypalConfigMap = {
  [PAYPAL_ROUTES.ONBOARDING.MAIN]: {
    screen: PaymentMethodOnboardingPayPalOnboardingNavigator
  }
};

const optInPaymentMethodsConfigMap = {
  [BPD_ROUTES.OPT_IN_PAYMENT_METHODS.MAIN]: {
    screen: OptInPaymentMethodNavigator
  }
};

const routeConfig = {
  ...baseRouteConfigMap,
  ...(bonusVacanzeEnabled ? bonusVacanzeConfigMap : {}),
  ...(bpdEnabled ? bpdConfigMap : {}),
  ...paypalConfigMap,
  ...(bpdOptInPaymentMethodsEnabled ? optInPaymentMethodsConfigMap : {})
};

const WalletNavigator = createCompatNavigatorFactory(createStackNavigator)(
  routeConfig,
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default WalletNavigator;
