import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback, useEffect, useRef } from "react";

import { AccessibilityInfo, AppState, StatusBar } from "react-native";
import SplashScreen from "react-native-splash-screen";
import DebugInfoOverlay from "./components/debug/DebugInfoOverlay";
import PagoPATestIndicatorOverlay from "./components/PagoPATestIndicatorOverlay";
import { LightModalRoot } from "./components/ui/LightModal";
import {
  configurePushNotificationListeners,
  setupAndroidNotificationChannel
} from "./features/pushNotifications/utils/configurePushNotification";
import { useAppThemeConfiguration } from "./hooks/useAppThemeConfiguration";
import { setLocale } from "./i18n";
import { IONavigationContainer } from "./navigation/AppStackNavigator";
import RootModal from "./screens/modal/RootModal";
import { applicationChangeState } from "./store/actions/application";
import { setScreenReaderEnabled } from "./store/actions/preferences";
import { Store } from "./store/actions/types";
import { useIODispatch, useIOSelector } from "./store/hooks";
import { isDebugModeEnabledSelector } from "./store/reducers/debug";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "./store/reducers/persistedPreferences";

/**
 * The main container of the application with:
 * - the Navigator
 * - the IdentificationModal, for authenticating user after login by CIE/SPID
 * - the SystemOffModal, shown if backend is unavailable
 * - the UpdateAppModal, if the backend is not compatible with the installed app version
 * - the root for displaying light modals
 */
const RootContainerInner = ({ store }: { store: Store }) => {
  const dispatch = useIODispatch();
  const preferredLanguage = useIOSelector(preferredLanguageSelector);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);
  const isDebugModeEnabled = useIOSelector(isDebugModeEnabledSelector);

  const clearNotificationHandlersRef = useRef<() => void>(() => undefined);

  const updateLocale = useCallback(() => {
    pipe(
      preferredLanguage,
      O.map(l => {
        setLocale(l);
      })
    );
  }, [preferredLanguage]);

  // Mount/unmount: set up app-state listener, accessibility, notifications, splash
  useEffect(() => {
    void setupAndroidNotificationChannel();
    // eslint-disable-next-line functional/immutable-data
    clearNotificationHandlersRef.current =
      configurePushNotificationListeners(store);

    dispatch(applicationChangeState(AppState.currentState));

    const subscription = AppState.addEventListener("change", activity => {
      dispatch(applicationChangeState(activity));
    });

    const accessibilitySubscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      isEnabled => {
        dispatch(setScreenReaderEnabled({ screenReaderEnabled: isEnabled }));
      }
    );

    void AccessibilityInfo.isScreenReaderEnabled().then(isEnabled => {
      dispatch(setScreenReaderEnabled({ screenReaderEnabled: isEnabled }));
    });

    SplashScreen.hide();

    return () => {
      subscription.remove();
      accessibilitySubscription.remove();
      clearNotificationHandlersRef.current();
    };
    // store and dispatch are stable singleton references; intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync locale whenever preferred language changes (runs on mount and on updates)
  useEffect(() => {
    updateLocale();
  }, [updateLocale]);

  return (
    <>
      <StatusBar
        translucent
        barStyle={"dark-content"}
        backgroundColor={"transparent"}
      />
      <IONavigationContainer />

      {/* When debug mode is enabled, the following information
      is displayed:
       - App version, e.g: v.2.x
       - Route name (as constant), e.g: MESSAGES_INBOX
       - pagoPA test indicator
       */}
      {isDebugModeEnabled && <DebugInfoOverlay />}
      {/* When debug mode is disabled, only the pagoPA
      test indicator is displayed. It's the same component,
      but not grouped with other indicators. */}
      {isPagoPATestEnabled && !isDebugModeEnabled && (
        <PagoPATestIndicatorOverlay />
      )}

      <RootModal />
      <LightModalRoot />
    </>
  );
};

const RootContainerFC = ({ store }: { store: Store }) => {
  useAppThemeConfiguration();

  return <RootContainerInner store={store} />;
};

export default RootContainerFC;
