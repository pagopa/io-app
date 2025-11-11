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
import { ErrorEvent, TransactionEvent } from "@sentry/core";
import { JSX } from "react";
import RootContainer from "./RootContainer";
import { persistor, store } from "./boot/configureStoreAndPersistor";
import { LightModalProvider } from "./components/ui/LightModal";
import {
  apiLoginUrlPrefix,
  apiUrlPrefix,
  bonusApiUrlPrefix,
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  pagoPaApiUrlPrefix,
  pagoPaApiUrlPrefixTest,
  sentryDsn,
  walletApiBaseUrl,
  walletApiUatBaseUrl
} from "./config";
import { isDevEnv } from "./utils/environment";
import { StatusMessages } from "./components/StatusMessages/StatusMessages";
import { AppFeedbackProvider } from "./features/appReviews/components/AppFeedbackProvider";
import { IOAlertVisibleContextProvider } from "./components/StatusMessages/IOAlertVisibleContext";
import { getEnv } from "./features/itwallet/common/utils/environment";

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
 * Handler to eventually remove any http client error on ios.
 * Since Sentry ios sdk 8.0.0 the tracking of http error 500 is enabled by default and may ignore `enableCaptureFailedRequests` attribute on init callback.
 * @param event
 * @returns
 */
const removeHttpClientError = <T extends ErrorEvent | TransactionEvent>(
  event: T
): T | null => {
  // Modify or drop the event here
  if (
    event.exception?.values?.[0]?.value?.match(/HTTPClientError/) ||
    event.exception?.values?.[0]?.value?.match(/HTTP Client Error/)
  ) {
    return null;
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
  const eventExcludeHttp500 = removeHttpClientError(safeEvent);
  const isSendRequired = event.tags?.isRequired;

  // Always send events marked as required
  if (isSendRequired) {
    return safeEvent;
  }

  // Always send events related to "Already closed" error from PDF renderer
  if (
    event.exception?.values?.[0]?.value?.match(
      /java.lang.IllegalStateException: Already closed/
    ) ||
    event.exception?.values?.[0]?.value?.match(/PDF renderer/)
  ) {
    return safeEvent;
  }

  // Apply sampling for non-required events (20% sampling rate)
  const sampleRate = 0.2;
  return Math.random() <= sampleRate ? eventExcludeHttp500 : null;
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
  tracePropagationTargets: [
    apiLoginUrlPrefix,
    apiUrlPrefix,
    pagoPaApiUrlPrefix,
    pagoPaApiUrlPrefixTest,
    bonusApiUrlPrefix,
    idPayApiBaseUrl,
    idPayApiUatBaseUrl,
    walletApiBaseUrl,
    walletApiUatBaseUrl,
    getEnv("pre").WALLET_PROVIDER_BASE_URL,
    getEnv("prod").WALLET_PROVIDER_BASE_URL
  ],
  enableCaptureFailedRequests: false,
  enableAppHangTracking: false,
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
                  <IOAlertVisibleContextProvider>
                    <BottomSheetModalProvider>
                      <LightModalProvider>
                        <AppFeedbackProvider>
                          <StatusMessages>
                            <RootContainer store={store} />
                          </StatusMessages>
                        </AppFeedbackProvider>
                      </LightModalProvider>
                    </BottomSheetModalProvider>
                  </IOAlertVisibleContextProvider>
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
