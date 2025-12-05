/* eslint-disable functional/immutable-data */
import {
  IOColors,
  useIOTheme,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import {
  LinkingOptions,
  NavigationContainer,
  NavigationContainerProps
} from "@react-navigation/native";
import { PropsWithChildren, ReactElement, useEffect, useRef } from "react";

import { Linking, View } from "react-native";
import { ReactNavigationInstrumentation } from "../App";
import { useStoredExperimentalDesign } from "../common/context/DSExperimentalContext";
import { useStoredFontPreference } from "../common/context/DSTypefaceContext";
import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import FocusAwareStatusBar from "../components/ui/FocusAwareStatusBar";
import { cgnLinkingOptions } from "../features/bonus/cgn/navigation/navigator";
import { fciLinkingOptions } from "../features/fci/navigation/FciStackNavigator";
import { idPayLinkingOptions } from "../features/idpay/common/navigation/linking";
import { IngressScreen } from "../features/ingress/screens/IngressScreen";
import { ITW_ROUTES } from "../features/itwallet/navigation/routes";
import { useItwLinkingOptions } from "../features/itwallet/navigation/useItwLinkingOptions";
import { storeLinkingUrl } from "../features/linking/actions";
import { MESSAGES_ROUTES } from "../features/messages/navigation/routes";
import { SERVICES_ROUTES } from "../features/services/common/navigation/routes";
import { SETTINGS_ROUTES } from "../features/settings/common/navigation/routes";
import { processUtmLink } from "../features/utmLink";
import { startApplicationInitialization } from "../store/actions/application";
import { setDebugCurrentRouteName } from "../store/actions/debug";
import { useIODispatch, useIOSelector, useIOStore } from "../store/hooks";
import { trackScreen } from "../store/middlewares/navigation";
import { isCGNEnabledAfterLoadSelector } from "../store/reducers/backendStatus/remoteConfig";
import { StartupStatusEnum, isStartupLoaded } from "../store/reducers/startup";
import {
  IONavigationDarkTheme,
  IONavigationLightTheme
} from "../theme/navigations";
import { isTestEnv } from "../utils/environment";
import { useOnFirstRender } from "../utils/hooks/useOnFirstRender";
import {
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "../utils/navigation";
import AuthenticatedStackNavigator from "./AuthenticatedStackNavigator";
import NavigationService, {
  navigationRef,
  setMainNavigatorReady
} from "./NavigationService";
import NotAuthenticatedStackNavigator from "./NotAuthenticatedStackNavigator";
import OfflineStackNavigator from "./OfflineStackNavigator";
import { linkingSubscription } from "./linkingSubscription";
import { AppParamsList } from "./params/AppParamsList";
import ROUTES from "./routes";

type OnStateChangeStateType = Parameters<
  NonNullable<NavigationContainerProps["onStateChange"]>
>[0];
export const isMainNavigatorReady = (state: OnStateChangeStateType) => {
  const routeName = state?.routes?.[0]?.name;
  return routeName === ROUTES.MAIN || routeName === ITW_ROUTES.MAIN;
};

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

  if (startupStatus === StartupStatusEnum.OFFLINE) {
    return <OfflineStackNavigator />;
  }

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
  const routeNameRef = useRef<string>(undefined);
  const dispatch = useIODispatch();
  const store = useIOStore();

  const cgnEnabled = useIOSelector(isCGNEnabledAfterLoadSelector);

  // Dark/Light Mode
  const { themeType } = useIOThemeContext();
  const theme = useIOTheme();

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
        [ROUTES.BARCODE_SCAN]: "main/scan",
        [SETTINGS_ROUTES.PROFILE_NAVIGATOR]: {
          path: "profile",
          screens: {
            [SETTINGS_ROUTES.PROFILE_PREFERENCES_HOME]: "preferences",
            [SETTINGS_ROUTES.PROFILE_PRIVACY]: "privacy",
            [SETTINGS_ROUTES.PROFILE_PRIVACY_MAIN]: "privacy-main"
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
        [ROUTES.PAGE_NOT_FOUND]: "*"
      }
    },
    subscribe: linkingSubscription(dispatch, store)
  };

  /**
   * If the app is swiped closed and it's opened with a deep link,
   * the linking event in the NavigationContainer is not triggered.
   * `Linking` has the option to get the initial URL when the app is opened.
   * We can use this to check if the app was opened with a deep link and
   * check if it has a `utm_medium` and `utm_source` parameters
   */
  useOnFirstRender(() => {
    void Linking.getInitialURL().then(initialUrl => {
      if (initialUrl) {
        processUtmLink(initialUrl, dispatch);
        /**
         *  We store the initialUrl in the redux store so that
         *  it can be processed in case we need any kind of data
         *  that would be accessible after the app's startup for that
         */
        dispatch(storeLinkingUrl(initialUrl));
      }
    });
  });

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
      <FocusAwareStatusBar
        backgroundColor={IOColors[theme["appBackground-primary"]]}
        barStyle={themeType === "dark" ? "light-content" : "dark-content"}
        animated
      />
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
  routingInstrumentation?: ReactNavigationInstrumentation;
}) => (
  <InnerNavigationContainer routingInstrumentation={routingInstrumentation}>
    <AppStackNavigator />
  </InnerNavigationContainer>
);

export const TestInnerNavigationContainer = isTestEnv
  ? InnerNavigationContainer
  : View;
