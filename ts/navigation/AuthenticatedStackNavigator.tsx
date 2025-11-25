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
import { ItwRemoteStackNavigator } from "../features/itwallet/presentation/remote/navigation/ItwRemoteStackNavigator.tsx";
import { ITW_REMOTE_ROUTES } from "../features/itwallet/presentation/remote/navigation/routes.ts";
import UnsupportedDeviceScreen from "../features/lollipop/screens/UnsupportedDeviceScreen";
import CheckEmailNavigator from "../features/mailCheck/navigation/CheckEmailNavigator.tsx";
import { MessagesStackNavigator } from "../features/messages/navigation/MessagesNavigator";
import { MESSAGES_ROUTES } from "../features/messages/navigation/routes";
import { MessagesSearchScreen } from "../features/messages/screens/MessagesSearchScreen";
import { PageNotFound } from "../features/pageNotFound/screens/index.tsx";
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
import OnboardingNavigator from "../features/onboarding/navigation/OnboardingNavigator.tsx";
import { PushNotificationEngagementScreen } from "../features/pushNotifications/screens/PushNotificationEngagementScreen.tsx";
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
        name={NOTIFICATIONS_ROUTES.SYSTEM_NOTIFICATION_PERMISSIONS}
        component={SystemNotificationPermissionsScreen}
        options={{
          gestureEnabled: true,
          headerShown: true,
          presentation: "modal"
        }}
      />
      <Stack.Screen
        name={NOTIFICATIONS_ROUTES.PUSH_NOTIFICATION_ENGAGEMENT}
        component={PushNotificationEngagementScreen}
        options={TransitionPresets.ModalSlideFromBottomIOS}
      />
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
        name={SETTINGS_ROUTES.PROFILE_NAVIGATOR}
        options={{
          ...hideHeaderOptions,
          ...TransitionPresets.SlideFromRightIOS,
          gestureEnabled: isGestureEnabled
        }}
        component={SettingsStackNavigator}
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
          options={{ ...hideHeaderOptions, gestureEnabled: isGestureEnabled }}
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

      {cdcEnabled && (
        <Stack.Screen
          name={CDC_ROUTES.CDC_MAIN}
          options={hideHeaderOptions}
          component={CdcNavigator}
        />
      )}

      <Stack.Screen
        name={ROUTES.WORKUNIT_GENERIC_FAILURE}
        options={hideHeaderOptions}
        component={WorkunitGenericFailure}
      />
      <Stack.Screen
        name={ROUTES.PAGE_NOT_FOUND}
        options={hideHeaderOptions}
        component={PageNotFound}
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
        name={FIMS_ROUTES.MAIN}
        options={hideHeaderOptions}
        component={FimsNavigator}
      />
      {isFciEnabled && (
        <Stack.Screen
          name={FCI_ROUTES.MAIN}
          options={hideHeaderOptions}
          component={FciStackNavigator}
        />
      )}

      <Stack.Screen
        name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN}
        component={IdPayOnboardingNavigator}
        options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
      />
      <Stack.Screen
        name={IDPayDetailsRoutes.IDPAY_DETAILS_MAIN}
        component={IDpayDetailsNavigator}
        options={{
          gestureEnabled: isGestureEnabled,
          ...hideHeaderOptions
        }}
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
        name={PaymentsReceiptRoutes.PAYMENT_RECEIPT_NAVIGATOR}
        component={PaymentsReceiptNavigator}
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
      <Stack.Screen
        name={ITW_REMOTE_ROUTES.MAIN}
        component={ItwRemoteStackNavigator}
        options={{ gestureEnabled: isGestureEnabled, ...hideHeaderOptions }}
      />
    </Stack.Navigator>
  );
};

export default AuthenticatedStackNavigator;
