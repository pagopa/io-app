import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";
import * as React from "react";
import WorkunitGenericFailure from "../components/error/WorkunitGenericFailure";
import { fimsEnabled } from "../config";
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
import {
  IDPayAuthorizationNavigator,
  IDPayAuthorizationRoutes
} from "../features/idpay/authorization/navigation/navigator";
import {
  IDPayConfigurationNavigator,
  IDPayConfigurationRoutes
} from "../features/idpay/initiative/configuration/navigation/navigator";
import {
  IDpayDetailsNavigator,
  IDPayDetailsRoutes
} from "../features/idpay/initiative/details/navigation";
import {
  IDPayOnboardingNavigator,
  IDPayOnboardingRoutes
} from "../features/idpay/onboarding/navigation/navigator";
import {
  IDPayUnsubscriptionNavigator,
  IDPayUnsubscriptionRoutes
} from "../features/idpay/unsubscription/navigation/navigator";
import UnsupportedDeviceScreen from "../features/lollipop/screens/UnsupportedDeviceScreen";
import UADONATION_ROUTES from "../features/uaDonations/navigation/routes";
import { UAWebViewScreen } from "../features/uaDonations/screens/UAWebViewScreen";
import { ZendeskStackNavigator } from "../features/zendesk/navigation/navigator";
import ZENDESK_ROUTES from "../features/zendesk/navigation/routes";
import { useIOSelector } from "../store/hooks";
import {
  isCdcEnabledSelector,
  isCGNEnabledSelector,
  isFciEnabledSelector,
  isFIMSEnabledSelector,
  isIdPayEnabledSelector
} from "../store/reducers/backendStatus";
import { isGestureEnabled } from "../utils/navigation";
import { MessagesStackNavigator } from "./MessagesNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import { AppParamsList } from "./params/AppParamsList";
import ProfileStackNavigator from "./ProfileNavigator";
import ROUTES from "./routes";
import ServicesNavigator from "./ServicesNavigator";
import { MainTabNavigator } from "./TabNavigator";
import WalletNavigator from "./WalletNavigator";

const Stack = createStackNavigator<AppParamsList>();

const AuthenticatedStackNavigator = () => {
  const cdcEnabled = useIOSelector(isCdcEnabledSelector);
  const isFimsEnabled = useIOSelector(isFIMSEnabledSelector) && fimsEnabled;
  const cgnEnabled = useIOSelector(isCGNEnabledSelector);
  const isFciEnabled = useIOSelector(isFciEnabledSelector);
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);

  return (
    <Stack.Navigator
      initialRouteName={ROUTES.MAIN}
      headerMode={"none"}
      screenOptions={{ gestureEnabled: false }}
    >
      <Stack.Screen name={ROUTES.MAIN} component={MainTabNavigator} />

      <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingNavigator} />

      <Stack.Screen
        name={ROUTES.UNSUPPORTED_DEVICE}
        component={UnsupportedDeviceScreen}
      />

      <Stack.Screen
        name={ROUTES.MESSAGES_NAVIGATOR}
        component={MessagesStackNavigator}
      />
      <Stack.Screen
        name={ROUTES.WALLET_NAVIGATOR}
        component={WalletNavigator}
      />
      <Stack.Screen
        name={ROUTES.SERVICES_NAVIGATOR}
        component={ServicesNavigator}
      />
      <Stack.Screen
        name={ROUTES.PROFILE_NAVIGATOR}
        component={ProfileStackNavigator}
      />

      {cgnEnabled && (
        <Stack.Screen
          name={CGN_ROUTES.ACTIVATION.MAIN}
          component={CgnActivationNavigator}
        />
      )}

      {cgnEnabled && (
        <Stack.Screen
          name={CGN_ROUTES.DETAILS.MAIN}
          component={CgnDetailsNavigator}
        />
      )}

      {cgnEnabled && (
        <Stack.Screen
          name={CGN_ROUTES.EYCA.ACTIVATION.MAIN}
          component={CgnEYCAActivationNavigator}
        />
      )}

      <Stack.Screen
        name={ROUTES.WORKUNIT_GENERIC_FAILURE}
        component={WorkunitGenericFailure}
      />
      <Stack.Screen
        name={ZENDESK_ROUTES.MAIN}
        component={ZendeskStackNavigator}
        options={{ ...TransitionPresets.ModalSlideFromBottomIOS }}
      />
      <Stack.Screen
        name={UADONATION_ROUTES.WEBVIEW}
        component={UAWebViewScreen}
      />

      {isFimsEnabled && (
        <Stack.Screen name={FIMS_ROUTES.MAIN} component={FimsNavigator} />
      )}

      {cdcEnabled && (
        <Stack.Screen
          name={CDC_ROUTES.BONUS_REQUEST_MAIN}
          component={CdcStackNavigator}
        />
      )}

      {isFciEnabled && (
        <Stack.Screen name={FCI_ROUTES.MAIN} component={FciStackNavigator} />
      )}

      {isIdPayEnabled && (
        <>
          <Stack.Screen
            name={IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN}
            component={IDPayOnboardingNavigator}
            options={{ gestureEnabled: isGestureEnabled }}
          />
          <Stack.Screen
            name={IDPayDetailsRoutes.IDPAY_DETAILS_MAIN}
            component={IDpayDetailsNavigator}
            options={{ gestureEnabled: isGestureEnabled }}
          />
          <Stack.Screen
            name={IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN}
            component={IDPayConfigurationNavigator}
            options={{ gestureEnabled: isGestureEnabled }}
          />
          <Stack.Screen
            name={IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN}
            component={IDPayUnsubscriptionNavigator}
            options={{ gestureEnabled: isGestureEnabled }}
          />
          <Stack.Screen
            name={IDPayAuthorizationRoutes.IDPAY_AUTHORIZATION_MAIN}
            component={IDPayAuthorizationNavigator}
            options={{ gestureEnabled: isGestureEnabled }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AuthenticatedStackNavigator;
