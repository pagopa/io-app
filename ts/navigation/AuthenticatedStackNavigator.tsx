import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";
import React from "react";
import { Platform } from "react-native";
import WorkunitGenericFailure from "../components/error/WorkunitGenericFailure";
import { BarcodeScanScreen } from "../features/barcode/screens/BarcodeScanScreen";
import { CdcStackNavigator } from "../features/bonus/cdc/navigation/CdcStackNavigator";
import { CDC_ROUTES } from "../features/bonus/cdc/navigation/routes";
import {
  CgnActivationNavigator,
  CgnDetailsNavigator,
  CgnEYCAActivationNavigator
} from "../features/bonus/cgn/navigation/navigator";
import CGN_ROUTES from "../features/bonus/cgn/navigation/routes";
import { FciStackNavigator } from "../features/fci/navigation/FciStackNavigator";
import { FCI_ROUTES } from "../features/fci/navigation/routes";
import { IdPayBarcodeNavigator } from "../features/idpay/barcode/navigation/navigator";
import { IdPayBarcodeRoutes } from "../features/idpay/barcode/navigation/routes";
import { IdPayCodeNavigator } from "../features/idpay/code/navigation/navigator";
import { IdPayCodeRoutes } from "../features/idpay/code/navigation/routes";
import { IdPayConfigurationNavigator } from "../features/idpay/configuration/navigation/navigator";
import { IdPayConfigurationRoutes } from "../features/idpay/configuration/navigation/routes";
import {
  IDpayDetailsNavigator,
  IDPayDetailsRoutes
} from "../features/idpay/details/navigation";
import { IdPayOnboardingNavigator } from "../features/idpay/onboarding/navigation/navigator";
import { IdPayOnboardingRoutes } from "../features/idpay/onboarding/navigation/routes";
import { IdPayPaymentNavigator } from "../features/idpay/payment/navigation/navigator";
import { IdPayPaymentRoutes } from "../features/idpay/payment/navigation/routes";
import { IDPayPaymentCodeScanScreen } from "../features/idpay/payment/screens/IDPayPaymentCodeScanScreen";
import { IdPayUnsubscriptionNavigator } from "../features/idpay/unsubscription/navigation/navigator";
import { IdPayUnsubscriptionRoutes } from "../features/idpay/unsubscription/navigation/routes";
import UnsupportedDeviceScreen from "../features/lollipop/screens/UnsupportedDeviceScreen";
import { MessagesStackNavigator } from "../features/messages/navigation/MessagesNavigator";
import { MESSAGES_ROUTES } from "../features/messages/navigation/routes";
import { WalletBarcodeNavigator } from "../features/payments/barcode/navigation/navigator";
import { PaymentsBarcodeRoutes } from "../features/payments/barcode/navigation/routes";
import { PaymentsCheckoutNavigator } from "../features/payments/checkout/navigation/navigator";
import { PaymentsCheckoutRoutes } from "../features/payments/checkout/navigation/routes";
import { PaymentsMethodDetailsNavigator } from "../features/payments/details/navigation/navigator";
import { PaymentsMethodDetailsRoutes } from "../features/payments/details/navigation/routes";
import { PaymentsOnboardingNavigator } from "../features/payments/onboarding/navigation/navigator";
import { PaymentsOnboardingRoutes } from "../features/payments/onboarding/navigation/routes";
import { PaymentsTransactionNavigator } from "../features/payments/transaction/navigation/navigator";
import { PaymentsTransactionRoutes } from "../features/payments/transaction/navigation/routes";
import ServicesNavigator from "../features/services/common/navigation/navigator";
import { SERVICES_ROUTES } from "../features/services/common/navigation/routes";
import UADONATION_ROUTES from "../features/uaDonations/navigation/routes";
import { UAWebViewScreen } from "../features/uaDonations/screens/UAWebViewScreen";
import { ZendeskStackNavigator } from "../features/zendesk/navigation/navigator";
import ZENDESK_ROUTES from "../features/zendesk/navigation/routes";
import { GalleryPermissionInstructionsScreen } from "../screens/misc/GalleryPermissionInstructionsScreen";
import { PaymentsTransactionBizEventsRoutes } from "../features/payments/bizEventsTransaction/navigation/routes";
import { PaymentsTransactionBizEventsNavigator } from "../features/payments/bizEventsTransaction/navigation/navigator";
import { useIOSelector } from "../store/hooks";
import {
  isCdcEnabledSelector,
  isCGNEnabledSelector,
  isFciEnabledSelector,
  isIdPayEnabledSelector
} from "../store/reducers/backendStatus";
import { isGestureEnabled } from "../utils/navigation";
import { ItwStackNavigator } from "../features/itwallet/navigation/ItwStackNavigator";
import { ITW_ROUTES } from "../features/itwallet/navigation/routes";
import { SearchScreen } from "../features/services/search/screens/SearchScreen";
import { FIMS_ROUTES, FimsNavigator } from "../features/fims/common/navigation";
import { MessagesSearchScreen } from "../features/messages/screens/MessagesSearchScreen";
import CheckEmailNavigator from "./CheckEmailNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import { AppParamsList } from "./params/AppParamsList";
import ProfileStackNavigator from "./ProfileNavigator";
import ROUTES from "./routes";
import { MainTabNavigator } from "./TabNavigator";
import WalletNavigator from "./WalletNavigator";

const Stack = createStackNavigator<AppParamsList>();

const hideHeaderOptions = {
  headerShown: false
};

const AuthenticatedStackNavigator = () => {
  const cdcEnabled = useIOSelector(isCdcEnabledSelector);
  const cgnEnabled = useIOSelector(isCGNEnabledSelector);
  const isFciEnabled = useIOSelector(isFciEnabledSelector);
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);

  return (
    <Stack.Navigator
      initialRouteName={ROUTES.MAIN}
      screenOptions={{
        gestureEnabled: false,
        headerMode: "screen"
      }}
    >
      <Stack.Screen
        name={ROUTES.MAIN}
        options={{ headerShown: false }}
        component={MainTabNavigator}
      />

      <Stack.Screen
        name={ROUTES.ONBOARDING}
        options={hideHeaderOptions}
        component={OnboardingNavigator}
      />

      <Stack.Screen
        name={ROUTES.CHECK_EMAIL}
        options={hideHeaderOptions}
        component={CheckEmailNavigator}
      />

      <Stack.Screen
        name={ROUTES.UNSUPPORTED_DEVICE}
        options={hideHeaderOptions}
        component={UnsupportedDeviceScreen}
      />

      <Stack.Screen
        name={MESSAGES_ROUTES.MESSAGES_NAVIGATOR}
        options={hideHeaderOptions}
        component={MessagesStackNavigator}
      />
      {/* This screen is outside the MessagesNavigator to change gesture and transion behaviour. */}
      <Stack.Screen
        name={MESSAGES_ROUTES.MESSAGES_SEARCH}
        component={MessagesSearchScreen}
        options={{
          ...hideHeaderOptions,
          gestureEnabled: false,
          ...Platform.select({
            ios: {
              animationEnabled: false
            },
            default: undefined
          })
        }}
      />
      <Stack.Screen
        name={ROUTES.WALLET_NAVIGATOR}
        options={hideHeaderOptions}
        component={WalletNavigator}
      />
      <Stack.Screen
        name={SERVICES_ROUTES.SERVICES_NAVIGATOR}
        options={{ ...hideHeaderOptions, gestureEnabled: isGestureEnabled }}
        component={ServicesNavigator}
      />
      {/* This screen is outside the ServicesNavigator to change gesture and transion behaviour. */}
      <Stack.Screen
        name={SERVICES_ROUTES.SEARCH}
        component={SearchScreen}
        options={{
          ...hideHeaderOptions,
          gestureEnabled: false,
          ...Platform.select({
            ios: {
              animationEnabled: false
            },
            default: undefined
          })
        }}
      />

      <Stack.Screen
        name={ROUTES.PROFILE_NAVIGATOR}
        options={{
          ...hideHeaderOptions,
          ...TransitionPresets.SlideFromRightIOS,
          gestureEnabled: isGestureEnabled
        }}
        component={ProfileStackNavigator}
      />

      <Stack.Screen
        name={ROUTES.BARCODE_SCAN}
        component={BarcodeScanScreen}
        options={{
          headerShown: false,
          ...TransitionPresets.ModalSlideFromBottomIOS,
          gestureEnabled: false
        }}
      />

      <Stack.Screen
        name={ROUTES.GALLERY_PERMISSION_INSTRUCTIONS}
        component={GalleryPermissionInstructionsScreen}
        options={{
          gestureEnabled: isGestureEnabled
        }}
      />

      {cgnEnabled && (
        <Stack.Screen
          name={CGN_ROUTES.ACTIVATION.MAIN}
          options={hideHeaderOptions}
          component={CgnActivationNavigator}
        />
      )}

      {cgnEnabled && (
        <Stack.Screen
          name={CGN_ROUTES.DETAILS.MAIN}
          options={hideHeaderOptions}
          component={CgnDetailsNavigator}
        />
      )}

      {cgnEnabled && (
        <Stack.Screen
          name={CGN_ROUTES.EYCA.ACTIVATION.MAIN}
          options={hideHeaderOptions}
          component={CgnEYCAActivationNavigator}
        />
      )}

      <Stack.Screen
        name={ROUTES.WORKUNIT_GENERIC_FAILURE}
        options={hideHeaderOptions}
        component={WorkunitGenericFailure}
      />

      <Stack.Group
        screenOptions={{
          headerShown: false,
          presentation: "modal"
        }}
      >
        <Stack.Screen
          name={ZENDESK_ROUTES.MAIN}
          component={ZendeskStackNavigator}
        />
      </Stack.Group>

      <Stack.Screen
        name={UADONATION_ROUTES.WEBVIEW}
        options={hideHeaderOptions}
        component={UAWebViewScreen}
      />
      <Stack.Screen
        name={FIMS_ROUTES.MAIN}
        options={hideHeaderOptions}
        component={FimsNavigator}
      />

      {cdcEnabled && (
        <Stack.Screen
          name={CDC_ROUTES.BONUS_REQUEST_MAIN}
          options={hideHeaderOptions}
          component={CdcStackNavigator}
        />
      )}

      {isFciEnabled && (
        <Stack.Screen
          name={FCI_ROUTES.MAIN}
          options={hideHeaderOptions}
          component={FciStackNavigator}
        />
      )}

      {isIdPayEnabled && (
        <>
          <Stack.Screen
            name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN}
            component={IdPayOnboardingNavigator}
            options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
          />
          <Stack.Screen
            name={IDPayDetailsRoutes.IDPAY_DETAILS_MAIN}
            component={IDpayDetailsNavigator}
            options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
          />
          <Stack.Screen
            name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR}
            component={IdPayConfigurationNavigator}
            options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
          />
          <Stack.Screen
            name={IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN}
            component={IdPayUnsubscriptionNavigator}
            options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
          />
          {/*
            This screen is outside the IDPayPaymentNavigator to enable the slide from bottom animation.
            FIXME IOBP-383: Using react-navigation 6.x we can achive this using a Stack.Group inside the IDPayPaymentNavigator
          */}
          <Stack.Screen
            name={IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN}
            component={IDPayPaymentCodeScanScreen}
            options={{
              ...hideHeaderOptions,
              ...TransitionPresets.ModalSlideFromBottomIOS,
              gestureEnabled: isGestureEnabled
            }}
          />
          <Stack.Screen
            name={IdPayPaymentRoutes.IDPAY_PAYMENT_MAIN}
            component={IdPayPaymentNavigator}
            options={{ gestureEnabled: false, ...hideHeaderOptions }}
          />
          <Stack.Screen
            name={IdPayCodeRoutes.IDPAY_CODE_MAIN}
            options={hideHeaderOptions}
            component={IdPayCodeNavigator}
          />
          <Stack.Screen
            name={IdPayBarcodeRoutes.IDPAY_BARCODE_MAIN}
            options={{
              gestureEnabled: isGestureEnabled,
              ...hideHeaderOptions
            }}
            component={IdPayBarcodeNavigator}
          />
        </>
      )}

      <Stack.Screen
        name={PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR}
        component={PaymentsOnboardingNavigator}
        options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
      />
      <Stack.Screen
        name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR}
        component={PaymentsCheckoutNavigator}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        name={PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_NAVIGATOR}
        component={PaymentsMethodDetailsNavigator}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        name={PaymentsTransactionRoutes.PAYMENT_TRANSACTION_NAVIGATOR}
        component={PaymentsTransactionNavigator}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        name={
          PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_NAVIGATOR
        }
        component={PaymentsTransactionBizEventsNavigator}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        name={PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR}
        component={WalletBarcodeNavigator}
        options={{
          ...TransitionPresets.ModalSlideFromBottomIOS,
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        name={ITW_ROUTES.MAIN}
        component={ItwStackNavigator}
        options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
      />
    </Stack.Navigator>
  );
};

export default AuthenticatedStackNavigator;
