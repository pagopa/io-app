/* eslint-disable functional/immutable-data */
import {
  DefaultTheme,
  LinkingOptions,
  NavigationContainer
} from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";
import { View } from "react-native";
import * as React from "react";
import { useRef } from "react";
import { IOColors } from "../components/core/variables/IOColors";
import workunitGenericFailure from "../components/error/WorkunitGenericFailure";
import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import {
  bpdEnabled,
  bpdOptInPaymentMethodsEnabled,
  fimsEnabled,
  myPortalEnabled,
  svEnabled
} from "../config";
import BPD_ROUTES from "../features/bonus/bpd/navigation/routes";
import { CdcStackNavigator } from "../features/bonus/cdc/navigation/CdcStackNavigator";
import { CDC_ROUTES } from "../features/bonus/cdc/navigation/routes";
import {
  CgnActivationNavigator,
  CgnDetailsNavigator,
  CgnEYCAActivationNavigator,
  cgnLinkingOptions
} from "../features/bonus/cgn/navigation/navigator";
import CGN_ROUTES from "../features/bonus/cgn/navigation/routes";
import { svLinkingOptions } from "../features/bonus/siciliaVola/navigation/navigator";
import {
  fciLinkingOptions,
  FciStackNavigator
} from "../features/fci/navigation/FciStackNavigator";
import { FCI_ROUTES } from "../features/fci/navigation/routes";
import {
  fimsLinkingOptions,
  FimsNavigator
} from "../features/fims/navigation/navigator";
import FIMS_ROUTES from "../features/fims/navigation/routes";
import { idPayLinkingOptions } from "../features/idpay/common/navigation/linking";
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
import IngressScreen from "../screens/ingress/IngressScreen";
import { setDebugCurrentRouteName } from "../store/actions/debug";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { trackScreen } from "../store/middlewares/navigation";
import {
  bpdRemoteConfigSelector,
  isCdcEnabledSelector,
  isCGNEnabledSelector,
  isFciEnabledSelector,
  isIdPayEnabledSelector,
  isFIMSEnabledSelector
} from "../store/reducers/backendStatus";
import { isTestEnv } from "../utils/environment";
import { IO_INTERNAL_LINK_PREFIX } from "../utils/navigation";
import authenticationNavigator from "./AuthenticationNavigator";
import { MessagesStackNavigator } from "./MessagesNavigator";
import NavigationService, { navigationRef } from "./NavigationService";
import OnboardingNavigator from "./OnboardingNavigator";
import { AppParamsList } from "./params/AppParamsList";
import ProfileStackNavigator from "./ProfileNavigator";
import ROUTES from "./routes";
import ServicesNavigator from "./ServicesNavigator";
import { MainTabNavigator } from "./TabNavigator";
import WalletNavigator from "./WalletNavigator";

const Stack = createStackNavigator<AppParamsList>();

export const AppStackNavigator = () => {
  const cdcEnabled = useIOSelector(isCdcEnabledSelector);
  const fimsEnabledSelector = useIOSelector(isFIMSEnabledSelector);
  const cgnEnabled = useIOSelector(isCGNEnabledSelector);
  const fciEnabledSelector = useIOSelector(isFciEnabledSelector);
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);

  const isFimsEnabled = fimsEnabled && fimsEnabledSelector;
  const isFciEnabled = fciEnabledSelector;
  return (
    <Stack.Navigator
      initialRouteName={"INGRESS"}
      headerMode={"none"}
      screenOptions={{ gestureEnabled: false }}
    >
      <Stack.Screen name={ROUTES.INGRESS} component={IngressScreen} />
      <Stack.Screen
        name={ROUTES.UNSUPPORTED_DEVICE}
        component={UnsupportedDeviceScreen}
      />
      <Stack.Screen
        name={ROUTES.AUTHENTICATION}
        component={authenticationNavigator}
      />
      <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingNavigator} />
      <Stack.Screen name={ROUTES.MAIN} component={MainTabNavigator} />

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
        component={workunitGenericFailure}
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
          />
          <Stack.Screen
            name={IDPayDetailsRoutes.IDPAY_DETAILS_MAIN}
            component={IDpayDetailsNavigator}
          />
          <Stack.Screen
            name={IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN}
            component={IDPayConfigurationNavigator}
          />
          <Stack.Screen
            name={IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN}
            component={IDPayUnsubscriptionNavigator}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const IOTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: IOColors.white
  }
};

const InnerNavigationContainer = (props: { children: React.ReactElement }) => {
  const routeNameRef = useRef<string>();
  const dispatch = useIODispatch();

  const cgnEnabled = useIOSelector(isCGNEnabledSelector);
  const isFimsEnabled = useIOSelector(isFIMSEnabledSelector) && fimsEnabled;
  const isFciEnabled = useIOSelector(isFciEnabledSelector);
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);

  const bpdRemoteConfig = useIOSelector(bpdRemoteConfigSelector);
  const isOptInPaymentMethodsEnabled =
    bpdRemoteConfig?.opt_in_payment_methods_v2 && bpdOptInPaymentMethodsEnabled;

  const linking: LinkingOptions = {
    enabled: false,
    prefixes: [IO_INTERNAL_LINK_PREFIX],
    config: {
      screens: {
        [ROUTES.MAIN]: {
          path: "main",
          screens: {
            [ROUTES.MESSAGES_HOME]: "messages",
            [ROUTES.WALLET_HOME]: "wallet",
            [ROUTES.SERVICES_HOME]: "services",
            [ROUTES.PROFILE_MAIN]: "profile"
          }
        },
        [ROUTES.PROFILE_NAVIGATOR]: {
          path: "profile",
          screens: {
            [ROUTES.PROFILE_PREFERENCES_HOME]: "preferences",
            [ROUTES.PROFILE_PRIVACY]: "privacy",
            [ROUTES.PROFILE_PRIVACY_MAIN]: "privacy-main"
          }
        },
        [ROUTES.WALLET_NAVIGATOR]: {
          path: "wallet",
          screens: {
            [ROUTES.PAYMENTS_HISTORY_SCREEN]: "payments-history",
            [ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPTS_SCREEN]:
              "card-onboarding-attempts",
            ...(bpdEnabled && {
              [BPD_ROUTES.CTA_BPD_IBAN_EDIT]: "bpd-iban-update"
            }),
            ...(isOptInPaymentMethodsEnabled && {
              [BPD_ROUTES.OPT_IN_PAYMENT_METHODS.MAIN]: {
                path: "bpd-opt-in",
                screens: {
                  [BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CHOICE]: "choice"
                }
              }
            })
          }
        },
        [ROUTES.SERVICES_NAVIGATOR]: {
          path: "services",
          screens: {
            [ROUTES.SERVICE_DETAIL]: {
              path: "service-detail",
              parse: {
                activate: activate => activate === "true"
              }
            },
            ...(myPortalEnabled && { [ROUTES.SERVICE_WEBVIEW]: "webview" }),
            ...(svEnabled && svLinkingOptions)
          }
        },
        ...(isFimsEnabled ? fimsLinkingOptions : {}),
        ...(cgnEnabled ? cgnLinkingOptions : {}),
        ...(isFciEnabled ? fciLinkingOptions : {}),
        ...(isIdPayEnabled ? idPayLinkingOptions : {}),
        [UADONATION_ROUTES.WEBVIEW]: "uadonations-webview",
        [ROUTES.WORKUNIT_GENERIC_FAILURE]: "*"
      }
    }
  };

  return (
    <NavigationContainer
      theme={IOTheme}
      ref={navigationRef}
      linking={linking}
      fallback={<LoadingSpinnerOverlay isLoading={true} />}
      onReady={() => {
        NavigationService.setNavigationReady();
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

        if (currentRouteName !== undefined) {
          dispatch(setDebugCurrentRouteName(currentRouteName));
          trackScreen(previousRouteName, currentRouteName);
        }
        routeNameRef.current = currentRouteName;
      }}
    >
      {props.children}
    </NavigationContainer>
  );
};

/**
 * Wraps the NavigationContainer with the AppStackNavigator (Root navigator of the app)
 * @constructor
 */
export const IONavigationContainer = () => (
  <InnerNavigationContainer>
    <AppStackNavigator />
  </InnerNavigationContainer>
);

export const TestInnerNavigationContainer = isTestEnv
  ? InnerNavigationContainer
  : View;
