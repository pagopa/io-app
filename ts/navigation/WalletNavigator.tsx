import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { bpdOptInPaymentMethodsEnabled } from "../config";
import {
  BpdDetailsNavigator,
  BpdOnboardingNavigator,
  OptInPaymentMethodNavigator
} from "../features/bonus/bpd/navigation/navigator";
import BPD_ROUTES from "../features/bonus/bpd/navigation/routes";
import IbanCTAEditScreen from "../features/bonus/bpd/screens/iban/IbanCTAEditScreen";
import MainIbanScreen from "../features/bonus/bpd/screens/iban/MainIbanScreen";
import {
  BONUS_ROUTES,
  BonusNavigator
} from "../features/bonus/common/navigation/navigator";
import { IdPayInstrumentInitiativesScreen } from "../features/idpay/wallet/screens/IdPayInstrumentInitiativesScreen";
import BancomatDetailScreen from "../features/wallet/bancomat/screen/BancomatDetailScreen";
import { BPayDetailScreen } from "../features/wallet/bancomatpay/screen/BPayDetailScreen";
import CobadgeDetailScreen from "../features/wallet/cobadge/screen/CobadgeDetailScreen";
import CreditCardDetailScreen from "../features/wallet/creditCard/screen/CreditCardDetailScreen";
import PaymentMethodOnboardingBPayNavigator from "../features/wallet/onboarding/bancomatPay/navigation/navigator";
import WALLET_ONBOARDING_BPAY_ROUTES from "../features/wallet/onboarding/bancomatPay/navigation/routes";
import ActivateBpdOnNewBPayScreen from "../features/wallet/onboarding/bancomatPay/screens/ActivateBpdOnNewBPayScreen";
import PaymentMethodOnboardingCoBadgeNavigator from "../features/wallet/onboarding/cobadge/navigation/navigator";
import WALLET_ONBOARDING_COBADGE_ROUTES from "../features/wallet/onboarding/cobadge/navigation/routes";
import ActivateBpdOnNewCoBadgeScreen from "../features/wallet/onboarding/cobadge/screens/ActivateBpdOnNewCoBadgeScreen";
import { PaymentMethodOnboardingPayPalOnboardingNavigator } from "../features/wallet/onboarding/paypal/navigation/navigator";
import PAYPAL_ROUTES from "../features/wallet/onboarding/paypal/navigation/routes";
import PayPalPspUpdateScreen from "../features/wallet/paypal/screen/PayPalPspUpdateScreen";
import PaypalDetailScreen from "../features/wallet/paypal/screen/PaypalDetailScreen";
import AddCardScreen from "../screens/wallet/AddCardScreen";
import AddCreditCardOutcomeCodeMessage from "../screens/wallet/AddCreditCardOutcomeCodeMessage";
import AddPaymentMethodScreen from "../screens/wallet/AddPaymentMethodScreen";
import ConfirmCardDetailsScreen from "../screens/wallet/ConfirmCardDetailsScreen";
import PaymentHistoryDetailsScreen from "../screens/wallet/PaymentHistoryDetailsScreen";
import PaymentsHistoryScreen from "../screens/wallet/PaymentsHistoryScreen";
import TransactionDetailsScreen from "../screens/wallet/TransactionDetailsScreen";
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
import { useIOSelector } from "../store/hooks";
import { bpdRemoteConfigSelector } from "../store/reducers/backendStatus";
import ROUTES from "./routes";

const Stack = createStackNavigator();

const bptRoutes = () => (
  <>
    <Stack.Screen
      name={BPD_ROUTES.ONBOARDING.MAIN}
      component={BpdOnboardingNavigator}
    />
    <Stack.Screen name={BPD_ROUTES.IBAN} component={MainIbanScreen} />
    <Stack.Screen
      name={BPD_ROUTES.DETAILS_MAIN}
      component={BpdDetailsNavigator}
    />
    <Stack.Screen
      name={BPD_ROUTES.CTA_BPD_IBAN_EDIT}
      component={IbanCTAEditScreen}
    />
    <Stack.Screen
      name={WALLET_ONBOARDING_BPAY_ROUTES.MAIN}
      component={PaymentMethodOnboardingBPayNavigator}
    />
    <Stack.Screen
      name={WALLET_ONBOARDING_BPAY_ROUTES.ACTIVATE_BPD_NEW}
      component={ActivateBpdOnNewBPayScreen}
    />
    <Stack.Screen
      name={WALLET_ONBOARDING_COBADGE_ROUTES.MAIN}
      component={PaymentMethodOnboardingCoBadgeNavigator}
    />
    <Stack.Screen
      name={WALLET_ONBOARDING_COBADGE_ROUTES.ACTIVATE_BPD_NEW}
      component={ActivateBpdOnNewCoBadgeScreen}
    />
  </>
);

const WalletNavigator = () => {
  const bpdRemoteConfig = useIOSelector(bpdRemoteConfigSelector);
  const isOptInPaymentMethodsEnabled =
    bpdRemoteConfig?.opt_in_payment_methods_v2 && bpdOptInPaymentMethodsEnabled;

  return (
    <Stack.Navigator
      initialRouteName={ROUTES.PAYMENT_SCAN_QR_CODE}
      screenOptions={{ gestureEnabled: true, headerShown: false }}
    >
      <Stack.Screen
        name={ROUTES.WALLET_IDPAY_INITIATIVE_LIST}
        component={IdPayInstrumentInitiativesScreen}
      />
      <Stack.Screen
        name={ROUTES.WALLET_ADD_PAYMENT_METHOD}
        component={AddPaymentMethodScreen}
      />
      <Stack.Screen
        name={ROUTES.WALLET_TRANSACTION_DETAILS}
        component={TransactionDetailsScreen}
      />
      <Stack.Screen
        name={ROUTES.WALLET_CREDIT_CARD_DETAIL}
        component={CreditCardDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.WALLET_BANCOMAT_DETAIL}
        component={BancomatDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.WALLET_PAYPAL_DETAIL}
        component={PaypalDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.WALLET_PAYPAL_UPDATE_PAYMENT_PSP}
        component={PayPalPspUpdateScreen}
      />
      <Stack.Screen
        name={ROUTES.WALLET_BPAY_DETAIL}
        component={BPayDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.WALLET_COBADGE_DETAIL}
        component={CobadgeDetailScreen}
      />
      <Stack.Screen name={ROUTES.WALLET_ADD_CARD} component={AddCardScreen} />
      <Stack.Screen
        name={ROUTES.WALLET_CONFIRM_CARD_DETAILS}
        component={ConfirmCardDetailsScreen}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT_SCAN_QR_CODE}
        component={ScanQrCodeScreen}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT_MANUAL_DATA_INSERTION}
        component={ManualDataInsertionScreen}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT_TRANSACTION_SUMMARY}
        component={TransactionSummaryScreen}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT_TRANSACTION_ERROR}
        component={TransactionErrorScreen}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD}
        component={ConfirmPaymentMethodScreen}
      />
      <Stack.Screen name={ROUTES.PAYMENT_PICK_PSP} component={PickPspScreen} />
      <Stack.Screen
        name={ROUTES.PAYMENT_PICK_PAYMENT_METHOD}
        component={PickPaymentMethodScreen}
      />
      <Stack.Screen
        name={ROUTES.PAYMENTS_HISTORY_SCREEN}
        component={PaymentsHistoryScreen}
      />
      <Stack.Screen
        name={ROUTES.PAYMENT_HISTORY_DETAIL_INFO}
        component={PaymentHistoryDetailsScreen}
      />
      <Stack.Screen
        name={ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPTS_SCREEN}
        component={CreditCardOnboardingAttemptsScreen}
      />
      <Stack.Screen
        name={ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPT_DETAIL}
        component={CreditCardOnboardingAttemptDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.ADD_CREDIT_CARD_OUTCOMECODE_MESSAGE}
        component={AddCreditCardOutcomeCodeMessage}
      />
      <Stack.Screen
        options={{ gestureEnabled: false }}
        name={ROUTES.PAYMENT_OUTCOMECODE_MESSAGE}
        component={PaymentOutcomeCodeMessage}
      />
      {/* Paypal */}
      <Stack.Screen
        name={PAYPAL_ROUTES.ONBOARDING.MAIN}
        component={PaymentMethodOnboardingPayPalOnboardingNavigator}
      />
      {/* Bonus */}
      <Stack.Screen name={BONUS_ROUTES.MAIN} component={BonusNavigator} />

      {/* BPD */}
      {bptRoutes()}
      {/* BPD Opt-In */}
      {isOptInPaymentMethodsEnabled && (
        <Stack.Screen
          name={BPD_ROUTES.OPT_IN_PAYMENT_METHODS.MAIN}
          component={OptInPaymentMethodNavigator}
        />
      )}
    </Stack.Navigator>
  );
};
export default WalletNavigator;
