import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";
import { Platform } from "react-native";

import WorkunitGenericFailure from "../components/error/WorkunitGenericFailure";
import { BarcodeScanScreen } from "../features/barcode/screens/BarcodeScanScreen";
import { CdcNavigator } from "../features/bonus/cdc/common/navigation/navigator.tsx";
import { CDC_ROUTES } from "../features/bonus/cdc/common/navigation/routes.ts";
import {
  CgnActivationNavigator,
  CgnDetailsNavigator,
  CgnEYCAActivationNavigator
} from "../features/bonus/cgn/navigation/navigator";
import CGN_ROUTES from "../features/bonus/cgn/navigation/routes";
import { FciStackNavigator } from "../features/fci/navigation/FciStackNavigator";
import { FCI_ROUTES } from "../features/fci/navigation/routes";
import { FIMS_ROUTES, FimsNavigator } from "../features/fims/common/navigation";
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
import { ItwStackNavigator } from "../features/itwallet/navigation/ItwStackNavigator";
import { ITW_ROUTES } from "../features/itwallet/navigation/routes";
import { ItwProximityStackNavigator } from "../features/itwallet/presentation/proximity/navigation/ItwProximityStackNavigator";
import { ITW_PROXIMITY_ROUTES } from "../features/itwallet/presentation/proximity/navigation/routes";
import { ItwRemoteStackNavigator } from "../features/itwallet/presentation/remote/navigation/ItwRemoteStackNavigator.tsx";
import { ITW_REMOTE_ROUTES } from "../features/itwallet/presentation/remote/navigation/routes.ts";
import UnsupportedDeviceScreen from "../features/lollipop/screens/UnsupportedDeviceScreen";
import CheckEmailNavigator from "../features/mailCheck/navigation/CheckEmailNavigator.tsx";
import { MessagesStackNavigator } from "../features/messages/navigation/MessagesNavigator";
import { MESSAGES_ROUTES } from "../features/messages/navigation/routes";
import { MessagesSearchScreen } from "../features/messages/screens/MessagesSearchScreen";
import OnboardingNavigator from "../features/onboarding/navigation/OnboardingNavigator.tsx";
import { PageNotFound } from "../features/pageNotFound/screens";
import { WalletBarcodeNavigator } from "../features/payments/barcode/navigation/navigator";
import { PaymentsBarcodeRoutes } from "../features/payments/barcode/navigation/routes";
import { PaymentsCheckoutNavigator } from "../features/payments/checkout/navigation/navigator";
import { PaymentsCheckoutRoutes } from "../features/payments/checkout/navigation/routes";
import { PaymentsMethodDetailsNavigator } from "../features/payments/details/navigation/navigator";
import { PaymentsMethodDetailsRoutes } from "../features/payments/details/navigation/routes";
import { PaymentsOnboardingNavigator } from "../features/payments/onboarding/navigation/navigator";
import { PaymentsOnboardingRoutes } from "../features/payments/onboarding/navigation/routes";
import { PaymentsReceiptNavigator } from "../features/payments/receipts/navigation/navigator";
import { PaymentsReceiptRoutes } from "../features/payments/receipts/navigation/routes";
import { NOTIFICATIONS_ROUTES } from "../features/pushNotifications/navigation/routes";
import { PushNotificationEngagementScreen } from "../features/pushNotifications/screens/PushNotificationEngagementScreen.tsx";
import { SystemNotificationPermissionsScreen } from "../features/pushNotifications/screens/SystemNotificationPermissionsScreen";
import ServicesNavigator from "../features/services/common/navigation/navigator";
import { SERVICES_ROUTES } from "../features/services/common/navigation/routes";
import { SearchScreen } from "../features/services/search/screens/SearchScreen";
import { SETTINGS_ROUTES } from "../features/settings/common/navigation/routes.ts";
import SettingsStackNavigator from "../features/settings/common/navigation/SettingsNavigator.tsx";
import { ZendeskStackNavigator } from "../features/zendesk/navigation/navigator";
import ZENDESK_ROUTES from "../features/zendesk/navigation/routes";
import { useIOSelector } from "../store/hooks";
import {
  isCdcAppVersionSupportedSelector,
  isCGNEnabledSelector,
  isFciEnabledSelector
} from "../store/reducers/backendStatus/remoteConfig";
import { isGestureEnabled } from "../utils/navigation";
import { AppParamsList } from "./params/AppParamsList";
import ROUTES from "./routes";
import { MainTabNavigator } from "./TabNavigator";

const Stack = createStackNavigator<AppParamsList>();

const hideHeaderOptions = {
  headerShown: false
};

const AuthenticatedStackNavigator = () => {
  const cdcEnabled = useIOSelector(isCdcAppVersionSupportedSelector);
  const cgnEnabled = useIOSelector(isCGNEnabledSelector);
  const isFciEnabled = useIOSelector(isFciEnabledSelector);

  return (
    <Stack.Navigator
      initialRouteName={ROUTES.MAIN}
      screenOptions={{
        gestureEnabled: false,
        headerMode: "screen"
      }}
    >
      <Stack.Screen
        component={MainTabNavigator}
        name={ROUTES.MAIN}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        component={OnboardingNavigator}
        name={ROUTES.ONBOARDING}
        options={hideHeaderOptions}
      />

      <Stack.Screen
        component={CheckEmailNavigator}
        name={ROUTES.CHECK_EMAIL}
        options={hideHeaderOptions}
      />

      <Stack.Screen
        component={UnsupportedDeviceScreen}
        name={ROUTES.UNSUPPORTED_DEVICE}
        options={hideHeaderOptions}
      />

      <Stack.Screen
        component={MessagesStackNavigator}
        name={MESSAGES_ROUTES.MESSAGES_NAVIGATOR}
        options={hideHeaderOptions}
      />
      {/* This screen is outside the MessagesNavigator to change gesture and transion behaviour. */}

      <Stack.Screen
        component={SystemNotificationPermissionsScreen}
        name={NOTIFICATIONS_ROUTES.SYSTEM_NOTIFICATION_PERMISSIONS}
        options={{
          gestureEnabled: true,
          headerShown: true,
          presentation: "modal"
        }}
      />
      <Stack.Screen
        component={PushNotificationEngagementScreen}
        name={NOTIFICATIONS_ROUTES.PUSH_NOTIFICATION_ENGAGEMENT}
        options={TransitionPresets.ModalSlideFromBottomIOS}
      />
      <Stack.Screen
        component={MessagesSearchScreen}
        name={MESSAGES_ROUTES.MESSAGES_SEARCH}
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
        component={ServicesNavigator}
        name={SERVICES_ROUTES.SERVICES_NAVIGATOR}
        options={{ ...hideHeaderOptions, gestureEnabled: isGestureEnabled }}
      />
      {/* This screen is outside the ServicesNavigator to change gesture and transion behaviour. */}
      <Stack.Screen
        component={SearchScreen}
        name={SERVICES_ROUTES.SEARCH}
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
        component={SettingsStackNavigator}
        name={SETTINGS_ROUTES.PROFILE_NAVIGATOR}
        options={{
          ...hideHeaderOptions,
          ...TransitionPresets.SlideFromRightIOS,
          gestureEnabled: isGestureEnabled
        }}
      />

      <Stack.Screen
        component={BarcodeScanScreen}
        name={ROUTES.BARCODE_SCAN}
        options={{
          headerShown: false,
          ...TransitionPresets.ModalSlideFromBottomIOS,
          gestureEnabled: false
        }}
      />

      {cgnEnabled && (
        <Stack.Screen
          component={CgnActivationNavigator}
          name={CGN_ROUTES.ACTIVATION.MAIN}
          options={hideHeaderOptions}
        />
      )}

      {cgnEnabled && (
        <Stack.Screen
          component={CgnDetailsNavigator}
          name={CGN_ROUTES.DETAILS.MAIN}
          options={{ ...hideHeaderOptions, gestureEnabled: isGestureEnabled }}
        />
      )}

      {cgnEnabled && (
        <Stack.Screen
          component={CgnEYCAActivationNavigator}
          name={CGN_ROUTES.EYCA.ACTIVATION.MAIN}
          options={hideHeaderOptions}
        />
      )}

      {cdcEnabled && (
        <Stack.Screen
          component={CdcNavigator}
          name={CDC_ROUTES.CDC_MAIN}
          options={hideHeaderOptions}
        />
      )}

      <Stack.Screen
        component={WorkunitGenericFailure}
        name={ROUTES.WORKUNIT_GENERIC_FAILURE}
        options={hideHeaderOptions}
      />
      <Stack.Screen
        component={PageNotFound}
        name={ROUTES.PAGE_NOT_FOUND}
        options={hideHeaderOptions}
      />

      <Stack.Group
        screenOptions={{
          headerShown: false,
          /* Avoid buggy modal behavior on Android */
          presentation: Platform.OS === "ios" ? "modal" : "card"
        }}
      >
        <Stack.Screen
          component={ZendeskStackNavigator}
          name={ZENDESK_ROUTES.MAIN}
        />
      </Stack.Group>

      <Stack.Screen
        component={FimsNavigator}
        name={FIMS_ROUTES.MAIN}
        options={hideHeaderOptions}
      />
      {isFciEnabled && (
        <Stack.Screen
          component={FciStackNavigator}
          name={FCI_ROUTES.MAIN}
          options={hideHeaderOptions}
        />
      )}

      <Stack.Screen
        component={IdPayOnboardingNavigator}
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN}
        options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
      />
      <Stack.Screen
        component={IDpayDetailsNavigator}
        name={IDPayDetailsRoutes.IDPAY_DETAILS_MAIN}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        component={IdPayConfigurationNavigator}
        name={IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR}
        options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
      />
      <Stack.Screen
        component={IdPayUnsubscriptionNavigator}
        name={IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN}
        options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
      />
      {/*
        This screen is outside the IDPayPaymentNavigator to enable the slide from bottom animation.
        FIXME IOBP-383: Using react-navigation 6.x we can achive this using a Stack.Group inside the IDPayPaymentNavigator
      */}
      <Stack.Screen
        component={IDPayPaymentCodeScanScreen}
        name={IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN}
        options={{
          ...hideHeaderOptions,
          ...TransitionPresets.ModalSlideFromBottomIOS,
          gestureEnabled: isGestureEnabled
        }}
      />
      <Stack.Screen
        component={IdPayPaymentNavigator}
        name={IdPayPaymentRoutes.IDPAY_PAYMENT_MAIN}
        options={{ gestureEnabled: false, ...hideHeaderOptions }}
      />
      <Stack.Screen
        component={IdPayCodeNavigator}
        name={IdPayCodeRoutes.IDPAY_CODE_MAIN}
        options={hideHeaderOptions}
      />
      <Stack.Screen
        component={IdPayBarcodeNavigator}
        name={IdPayBarcodeRoutes.IDPAY_BARCODE_MAIN}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />

      <Stack.Screen
        component={PaymentsOnboardingNavigator}
        name={PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR}
        options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
      />
      <Stack.Screen
        component={PaymentsCheckoutNavigator}
        name={PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        component={PaymentsMethodDetailsNavigator}
        name={PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_NAVIGATOR}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        component={PaymentsReceiptNavigator}
        name={PaymentsReceiptRoutes.PAYMENT_RECEIPT_NAVIGATOR}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        component={WalletBarcodeNavigator}
        name={PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR}
        options={{
          ...TransitionPresets.ModalSlideFromBottomIOS,
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
      />
      <Stack.Screen
        component={ItwStackNavigator}
        name={ITW_ROUTES.MAIN}
        options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
      />
      <Stack.Screen
        component={ItwRemoteStackNavigator}
        name={ITW_REMOTE_ROUTES.MAIN}
        options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
      />
      <Stack.Screen
        component={ItwProximityStackNavigator}
        name={ITW_PROXIMITY_ROUTES.MAIN}
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
