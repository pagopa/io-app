/* eslint-disable functional/immutable-data */
import { useIOThemeContext } from "@pagopa/io-app-design-system";
import {
  LinkingOptions,
  NavigationContainer,
  NavigationContainerProps
} from "@react-navigation/native";
import { PropsWithChildren, ReactElement, useEffect, useRef } from "react";

import { View } from "react-native";
import { useStoredExperimentalDesign } from "../common/context/DSExperimentalContext";
import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import { cgnLinkingOptions } from "../features/bonus/cgn/navigation/navigator";
import { fciLinkingOptions } from "../features/fci/navigation/FciStackNavigator";
import { idPayLinkingOptions } from "../features/idpay/common/navigation/linking";
import { MESSAGES_ROUTES } from "../features/messages/navigation/routes";
import { IngressScreen } from "../features/ingress/screens/IngressScreen";
import { startApplicationInitialization } from "../store/actions/application";
import { setDebugCurrentRouteName } from "../store/actions/debug";
import { useIODispatch, useIOSelector, useIOStore } from "../store/hooks";
import { trackScreen } from "../store/middlewares/navigation";
import { isCGNEnabledSelector } from "../store/reducers/backendStatus/remoteConfig";
import { StartupStatusEnum, isStartupLoaded } from "../store/reducers/startup";
import {
  IONavigationDarkTheme,
  IONavigationLightTheme
} from "../theme/navigations";
import { isTestEnv } from "../utils/environment";
import {
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "../utils/navigation";
import { SERVICES_ROUTES } from "../features/services/common/navigation/routes";
import { useItwLinkingOptions } from "../features/itwallet/navigation/useItwLinkingOptions";
import { ReactNavigationInstrumentation } from "../App";
import { useStoredFontPreference } from "../common/context/DSTypefaceContext";
import AuthenticatedStackNavigator from "./AuthenticatedStackNavigator";
import NavigationService, {
  navigationRef,
  setMainNavigatorReady
} from "./NavigationService";
import NotAuthenticatedStackNavigator from "./NotAuthenticatedStackNavigator";
import { AppParamsList } from "./params/AppParamsList";
import ROUTES from "./routes";
import { linkingSubscription } from "./linkingSubscription";

type OnStateChangeStateType = Parameters<
  NonNullable<NavigationContainerProps["onStateChange"]>
>[0];
const isMainNavigatorReady = (state: OnStateChangeStateType) =>
  state &&
  state.routes &&
  state.routes.length > 0 &&
  state.routes[0].name === ROUTES.MAIN;

export const AppStackNavigator = (): ReactElement => {
  // This hook is used since we are in a child of the Context Provider
  // to setup the experimental design system value from AsyncStorage
  // remove this once the experimental design system is stable
  useStoredExperimentalDesign();
  useStoredFontPreference();

  const dispatch = useIODispatch();

  const startupStatus = useIOSelector(isStartupLoaded);

  useEffect(() => {
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

type InnerNavigationContainerProps = PropsWithChildren<{
  routingInstrumentation?: ReactNavigationInstrumentation;
}>;

const InnerNavigationContainer = (props: InnerNavigationContainerProps) => {
  const routeNameRef = useRef<string>();
  const dispatch = useIODispatch();
  const store = useIOStore();

  const cgnEnabled = useIOSelector(isCGNEnabledSelector);

  // Dark/Light Mode
  const { themeType } = useIOThemeContext();

  const linking: LinkingOptions<AppParamsList> = {
    enabled: !isTestEnv, // disable linking in test env
    prefixes: [IO_INTERNAL_LINK_PREFIX, IO_UNIVERSAL_LINK_PREFIX],
    config: {
      initialRouteName: ROUTES.MAIN,
      screens: {
        [ROUTES.MAIN]: {
          path: "main",
          screens: {
            [MESSAGES_ROUTES.MESSAGES_HOME]: "messages",
            [ROUTES.WALLET_HOME]: "wallet",
            [SERVICES_ROUTES.SERVICES_HOME]: "services",
            [ROUTES.PAYMENTS_HOME]: "payments"
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
        [SERVICES_ROUTES.SERVICES_NAVIGATOR]: {
          path: "services",
          screens: {
            [SERVICES_ROUTES.SERVICE_DETAIL]: {
              path: "service-detail",
              parse: {
                activate: activate => activate === "true"
              }
            }
          }
        },
        ...useItwLinkingOptions(),
        ...fciLinkingOptions,
        ...(cgnEnabled ? cgnLinkingOptions : {}),
        ...idPayLinkingOptions,
        [ROUTES.WORKUNIT_GENERIC_FAILURE]: "*"
      }
    },
    subscribe: linkingSubscription(dispatch, store)
  };

  return (
    <NavigationContainer
      theme={
        themeType === "light" ? IONavigationLightTheme : IONavigationDarkTheme
      }
      ref={navigationRef}
      linking={linking}
      fallback={<LoadingSpinnerOverlay isLoading={true} />}
      onReady={() => {
        if (props.routingInstrumentation) {
          props.routingInstrumentation.registerNavigationContainer(
            navigationRef
          );
        }
        NavigationService.setNavigationReady();
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async state => {
        if (isMainNavigatorReady(state)) {
          setMainNavigatorReady();
        }
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
export const IONavigationContainer = ({
  routingInstrumentation
}: {
  routingInstrumentation: ReactNavigationInstrumentation;
}) => (
  <InnerNavigationContainer routingInstrumentation={routingInstrumentation}>
    <AppStackNavigator />
  </InnerNavigationContainer>
);

export const TestInnerNavigationContainer = isTestEnv
  ? InnerNavigationContainer
  : View;
