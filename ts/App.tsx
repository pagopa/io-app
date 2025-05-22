import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  IODSExperimentalContextProvider,
  IONewTypefaceContextProvider,
  IOThemeContextProvider,
  ToastProvider
} from "@pagopa/io-app-design-system";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import * as Sentry from "@sentry/react-native";
import { ErrorEvent, TransactionEvent } from "@sentry/types";
import RootContainer from "./RootContainer";
import { persistor, store } from "./boot/configureStoreAndPersistor";
import { LightModalProvider } from "./components/ui/LightModal";
import { sentryDsn } from "./config";
import { isDevEnv } from "./utils/environment";
import { StatusMessages } from "./components/StatusMessages";

export type ReactNavigationInstrumentation = ReturnType<
  typeof Sentry.reactNavigationIntegration
>;

const removeUserFromEvent = <T extends ErrorEvent | TransactionEvent>(
  event: T
): T => {
  // console.log(JSON.stringify(event));
  // Modify or drop the event here
  if (event.user) {
    // Don't send user's email address
    return { ...event, user: undefined };
  }
  return event;
};

/**
 * Processes events before sending them to Sentry.
 * Removes user data from all events and applies sampling logic.
 * @param event - The Sentry event (exception)  to process
 * @returns The processed event if it should be sent, or null to drop it
 */
const beforeSendHandler = <T extends ErrorEvent | TransactionEvent>(
  event: T
): T | null => {
  const safeEvent = removeUserFromEvent(event);
  const isSendRequired = event.contexts?.send?.isRequired;

  // Always send events marked as required
  if (isSendRequired) {
    return safeEvent;
  }

  // Apply sampling for non-required events (20% sampling rate)
  const sampleRate = 0.2;
  return Math.random() <= sampleRate ? safeEvent : null;
};

Sentry.setUser(null);

Sentry.init({
  dsn: sentryDsn,
  beforeSend(event) {
    return beforeSendHandler(event);
  },
  beforeSendTransaction(event) {
    return removeUserFromEvent(event);
  },
  ignoreErrors: [
    /HTTPClientError/i,
    /HTTP Client Error with status code: 500/i,
    /ANR/i,
    /ApplicationNotResponding/i,
    /Background ANR/i
  ],
  integrations: integrations => [
    ...integrations,
    Sentry.reactNativeTracingIntegration()
  ],
  enabled: !isDevEnv,
  // https://sentry.zendesk.com/hc/en-us/articles/23337524872987-Why-is-the-message-in-my-error-being-truncated
  maxValueLength: 3000,
  tracesSampleRate: 0.2,
  sampleRate: 1
});

// Infer the `RootState` and `AppDispatch` types from the store itself export
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Main component of the application
 * @constructor
 */
const App = (): JSX.Element => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <IODSExperimentalContextProvider>
        <IONewTypefaceContextProvider>
          <IOThemeContextProvider theme={"light"}>
            <ToastProvider>
              <Provider store={store}>
                <PersistGate loading={undefined} persistor={persistor}>
                  <BottomSheetModalProvider>
                    <LightModalProvider>
                      <StatusMessages>
                        <RootContainer store={store} />
                      </StatusMessages>
                    </LightModalProvider>
                  </BottomSheetModalProvider>
                </PersistGate>
              </Provider>
            </ToastProvider>
          </IOThemeContextProvider>
        </IONewTypefaceContextProvider>
      </IODSExperimentalContextProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

/**
 * We wrap the main app component with the sentry utility function to handle
 * the Performance monitoring
 */
export default Sentry.wrap(App);
