/* eslint-disable functional/immutable-data */
import {
  DefaultTheme,
  LinkingOptions,
  NavigationContainer
} from "@react-navigation/native";
import * as React from "react";
import { useRef } from "react";
import { View } from "react-native";
import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import { IOColors } from "../components/core/variables/IOColors";
import {
  bpdEnabled,
  bpdOptInPaymentMethodsEnabled,
  fimsEnabled,
  myPortalEnabled,
  svEnabled
} from "../config";
import BPD_ROUTES from "../features/bonus/bpd/navigation/routes";
import { cgnLinkingOptions } from "../features/bonus/cgn/navigation/navigator";
import { svLinkingOptions } from "../features/bonus/siciliaVola/navigation/navigator";
import { fciLinkingOptions } from "../features/fci/navigation/FciStackNavigator";
import { fimsLinkingOptions } from "../features/fims/navigation/navigator";
import { idPayLinkingOptions } from "../features/idpay/common/navigation/linking";
import UADONATION_ROUTES from "../features/uaDonations/navigation/routes";
import IngressScreen from "../screens/ingress/IngressScreen";
import { startApplicationInitialization } from "../store/actions/application";
import { setDebugCurrentRouteName } from "../store/actions/debug";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { trackScreen } from "../store/middlewares/navigation";
import {
  bpdRemoteConfigSelector,
  isCGNEnabledSelector,
  isFIMSEnabledSelector
} from "../store/reducers/backendStatus";
import { StartupStatusEnum, isStartupLoaded } from "../store/reducers/startup";
import { isTestEnv } from "../utils/environment";
import {
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "../utils/navigation";
import AuthenticatedStackNavigator from "./AuthenticatedStackNavigator";
import NavigationService, { navigationRef } from "./NavigationService";
import NotAuthenticatedStackNavigator from "./NotAuthenticatedStackNavigator";
import ROUTES from "./routes";

export const AppStackNavigator = (): React.ReactElement => {
  const dispatch = useIODispatch();

  const startupStatus = useIOSelector(isStartupLoaded);

  React.useEffect(() => {
    dispatch(startApplicationInitialization());
  }, [dispatch]);

  if (startupStatus === StartupStatusEnum.NOT_AUTHENTICATED) {
    return <NotAuthenticatedStackNavigator />;
  }

  if (startupStatus === StartupStatusEnum.INITIAL) {
    return <IngressScreen />;
  }

  return <AuthenticatedStackNavigator />;
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

  const bpdRemoteConfig = useIOSelector(bpdRemoteConfigSelector);
  const isOptInPaymentMethodsEnabled =
    bpdRemoteConfig?.opt_in_payment_methods_v2 && bpdOptInPaymentMethodsEnabled;

  const linking: LinkingOptions = {
    enabled: !isTestEnv, // disable linking in test env
    prefixes: [IO_INTERNAL_LINK_PREFIX, IO_UNIVERSAL_LINK_PREFIX],
    config: {
      initialRouteName: ROUTES.MAIN,
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
        ...fciLinkingOptions,
        ...(isFimsEnabled ? fimsLinkingOptions : {}),
        ...(cgnEnabled ? cgnLinkingOptions : {}),
        ...idPayLinkingOptions,
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
