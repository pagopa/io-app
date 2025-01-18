import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { memo, useCallback, useEffect } from "react";
import { AppState, AppStateStatus, StatusBar } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { useSelector } from "react-redux";
import { ReactNavigationInstrumentation } from "./App";
import DebugInfoOverlay from "./components/DebugInfoOverlay";
import PagoPATestIndicatorOverlay from "./components/PagoPATestIndicatorOverlay";
import { LightModalRoot } from "./components/ui/LightModal";
import configurePushNotifications from "./features/pushNotifications/utils/configurePushNotification";
import { setLocale } from "./i18n";
import { IONavigationContainer } from "./navigation/AppStackNavigator";
import RootModal from "./screens/modal/RootModal";
import { applicationChangeState } from "./store/actions/application";
import { useIODispatch } from "./store/hooks";
import { isDebugModeEnabledSelector } from "./store/reducers/debug";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "./store/reducers/persistedPreferences";
import customVariables from "./theme/variables";
import { useBackgroundFetch } from "./features/background/hooks/useBackgroundFetch";

type RootContainerProps = {
  routingInstumentation: ReactNavigationInstrumentation;
};

/**
 * The main container of the application with:
 * - the Navigator
 * - the IdentificationModal, for authenticating user after login by CIE/SPID
 * - the SystemOffModal, shown if backend is unavailable
 * - the UpdateAppModal, if the backend is not compatible with the installed app version
 * - the root for displaying light modals
 */
export const RootContainer = memo((props: RootContainerProps) => {
  const dispatch = useIODispatch();

  const preferredLanguage = useSelector(preferredLanguageSelector);
  const isPagoPATestEnabled = useSelector(isPagoPATestEnabledSelector);
  const isDebugModeEnabled = useSelector(isDebugModeEnabledSelector);

  // Configure background fetch
  useBackgroundFetch();

  const handleApplicationActivity = useCallback(
    (activity: AppStateStatus) => {
      dispatch(applicationChangeState(activity));
    },
    [dispatch]
  );

  /* Configure the application to receive push notifications */
  useEffect(() => {
    configurePushNotifications();
  }, []);

  useEffect(() => {
    // boot: send the status of the application
    handleApplicationActivity(AppState.currentState);

    const subscription = AppState.addEventListener(
      "change",
      handleApplicationActivity
    );

    // Hide splash screen
    SplashScreen.hide();

    return () => {
      subscription.remove();
    };
  }, [handleApplicationActivity]);

  /**
   * If preferred language is set in the Persisted Store it sets the app global Locale
   * otherwise it continues using the default locale set from the SO
   */
  useEffect(() => {
    pipe(
      preferredLanguage,
      O.map(l => {
        setLocale(l);
      })
    );
  }, [preferredLanguage]);

  return (
    <>
      <StatusBar
        barStyle={"dark-content"}
        backgroundColor={customVariables.androidStatusBarColor}
      />

      <IONavigationContainer
        routingInstrumentation={props.routingInstumentation}
      />

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
});
