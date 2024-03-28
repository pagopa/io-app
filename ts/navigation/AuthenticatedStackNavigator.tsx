import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";
import * as React from "react";
import WorkunitGenericFailure from "../components/error/WorkunitGenericFailure";
import { fimsEnabled } from "../config";
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
import { FimsNavigator } from "../features/fims/navigation/navigator";
import FIMS_ROUTES from "../features/fims/navigation/routes";
import { IdPayBarcodeNavigator } from "../features/idpay/barcode/navigation/navigator";
import { IdPayBarcodeRoutes } from "../features/idpay/barcode/navigation/routes";
import { IdPayCodeNavigator } from "../features/idpay/code/navigation/navigator";
import { IdPayCodeRoutes } from "../features/idpay/code/navigation/routes";
import {
  IDPayConfigurationNavigator,
  IDPayConfigurationRoutes
} from "../features/idpay/configuration/navigation/navigator";
import {
  IDpayDetailsNavigator,
  IDPayDetailsRoutes
} from "../features/idpay/details/navigation";
import {
  IDPayOnboardingNavigator,
  IDPayOnboardingRoutes
} from "../features/idpay/onboarding/navigation/navigator";
import {
  IDPayPaymentNavigator,
  IDPayPaymentRoutes
} from "../features/idpay/payment/navigation/navigator";
import { IDPayPaymentCodeScanScreen } from "../features/idpay/payment/screens/IDPayPaymentCodeScanScreen";
import {
  IDPayUnsubscriptionNavigator,
  IDPayUnsubscriptionRoutes
} from "../features/idpay/unsubscription/navigation/navigator";
import UnsupportedDeviceScreen from "../features/lollipop/screens/UnsupportedDeviceScreen";
import { MessagesStackNavigator } from "../features/messages/navigation/MessagesNavigator";
import { MESSAGES_ROUTES } from "../features/messages/navigation/routes";
import {
  WalletNavigator as NewWalletNavigator,
  WalletRoutes as NewWalletRoutes
} from "../features/newWallet/navigation";
import { WalletBarcodeNavigator } from "../features/payments/barcode/navigation/navigator";
import { WalletBarcodeRoutes } from "../features/payments/barcode/navigation/routes";
import {
  WalletDetailsNavigator,
  WalletDetailsRoutes
} from "../features/payments/details/navigation/navigator";
import {
  WalletOnboardingNavigator,
  WalletOnboardingRoutes
} from "../features/payments/onboarding/navigation/navigator";
import { WalletPaymentNavigator } from "../features/payments/payment/navigation/navigator";
import { WalletPaymentRoutes } from "../features/payments/payment/navigation/routes";
import {
  WalletTransactionNavigator,
  WalletTransactionRoutes
} from "../features/payments/transaction/navigation/navigator";
import UADONATION_ROUTES from "../features/uaDonations/navigation/routes";
import { UAWebViewScreen } from "../features/uaDonations/screens/UAWebViewScreen";
import { ZendeskStackNavigator } from "../features/zendesk/navigation/navigator";
import ZENDESK_ROUTES from "../features/zendesk/navigation/routes";
import { GalleryPermissionInstructionsScreen } from "../screens/misc/GalleryPermissionInstructionsScreen";
import { useIOSelector } from "../store/hooks";
import {
  isCdcEnabledSelector,
  isCGNEnabledSelector,
  isFciEnabledSelector,
  isFIMSEnabledSelector,
  isIdPayEnabledSelector
} from "../store/reducers/backendStatus";
import { isNewWalletSectionEnabledSelector } from "../store/reducers/persistedPreferences";
import { isGestureEnabled } from "../utils/navigation";
import CheckEmailNavigator from "./CheckEmailNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import { AppParamsList } from "./params/AppParamsList";
import ProfileStackNavigator from "./ProfileNavigator";
import ROUTES from "./routes";
import ServicesNavigator from "./ServicesNavigator";
import { MainTabNavigator } from "./TabNavigator";
import WalletNavigator from "./WalletNavigator";

const Stack = createStackNavigator<AppParamsList>();

const hideHeaderOptions = {
  headerShown: false
};

const AuthenticatedStackNavigator = () => {
  const cdcEnabled = useIOSelector(isCdcEnabledSelector);
  const isFimsEnabled = useIOSelector(isFIMSEnabledSelector) && fimsEnabled;
  const cgnEnabled = useIOSelector(isCGNEnabledSelector);
  const isFciEnabled = useIOSelector(isFciEnabledSelector);
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);
  const isNewWalletSectionEnabled = useIOSelector(
    isNewWalletSectionEnabledSelector
  );

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
      {isNewWalletSectionEnabled ? (
        <Stack.Screen
          name={NewWalletRoutes.WALLET_NAVIGATOR}
          options={hideHeaderOptions}
          component={NewWalletNavigator}
        />
      ) : (
        <Stack.Screen
          name={ROUTES.WALLET_NAVIGATOR}
          options={hideHeaderOptions}
          component={WalletNavigator}
        />
      )}
      <Stack.Screen
        name={ROUTES.SERVICES_NAVIGATOR}
        options={hideHeaderOptions}
        component={ServicesNavigator}
      />
      <Stack.Screen
        name={ROUTES.PROFILE_NAVIGATOR}
        options={hideHeaderOptions}
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
      <Stack.Screen
        name={ZENDESK_ROUTES.MAIN}
        component={ZendeskStackNavigator}
        options={{
          ...TransitionPresets.ModalSlideFromBottomIOS,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        name={UADONATION_ROUTES.WEBVIEW}
        options={hideHeaderOptions}
        component={UAWebViewScreen}
      />

      {isFimsEnabled && (
        <Stack.Screen
          name={FIMS_ROUTES.MAIN}
          options={hideHeaderOptions}
          component={FimsNavigator}
        />
      )}

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
            name={IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN}
            component={IDPayOnboardingNavigator}
            options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
          />
          <Stack.Screen
            name={IDPayDetailsRoutes.IDPAY_DETAILS_MAIN}
            component={IDpayDetailsNavigator}
            options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
          />
          <Stack.Screen
            name={IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN}
            component={IDPayConfigurationNavigator}
            options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
          />
          <Stack.Screen
            name={IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN}
            component={IDPayUnsubscriptionNavigator}
            options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
          />
          {/* 
            This screen is outside the IDPayPaymentNavigator to enable the slide from bottom animation.
            FIXME IOBP-383: Using react-navigation 6.x we can achive this using a Stack.Group inside the IDPayPaymentNavigator
          */}
          <Stack.Screen
            name={IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN}
            component={IDPayPaymentCodeScanScreen}
            options={{
              ...hideHeaderOptions,
              ...TransitionPresets.ModalSlideFromBottomIOS,
              gestureEnabled: isGestureEnabled
            }}
          />
          <Stack.Screen
            name={IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN}
            component={IDPayPaymentNavigator}
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
        name={WalletOnboardingRoutes.WALLET_ONBOARDING_MAIN}
        component={WalletOnboardingNavigator}
        options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
      />
      <Stack.Screen
        name={WalletPaymentRoutes.WALLET_PAYMENT_MAIN}
        component={WalletPaymentNavigator}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        name={WalletDetailsRoutes.WALLET_DETAILS_MAIN}
        component={WalletDetailsNavigator}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        name={WalletTransactionRoutes.WALLET_TRANSACTION_MAIN}
        component={WalletTransactionNavigator}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        name={WalletBarcodeRoutes.WALLET_BARCODE_MAIN}
        component={WalletBarcodeNavigator}
        options={{
          ...TransitionPresets.ModalSlideFromBottomIOS,
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthenticatedStackNavigator;
