import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  IODSExperimentalContextProvider,
  IOThemeContextProvider,
  ToastProvider
} from "@pagopa/io-app-design-system";
import * as React from "react";
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

export const routingInstrumentation = new Sentry.ReactNavigationInstrumentation(
  {
    enableTimeToInitialDisplay: true
  }
);

const removeUserFromEvent = (event: ErrorEvent | TransactionEvent) => {
  // console.log(JSON.stringify(event));
  // Modify or drop the event here
  if (event.user) {
    // Don't send user's email address
    return { ...event, user: undefined };
  }
  return event;
};

Sentry.setUser(null);

Sentry.init({
  dsn: sentryDsn,
  beforeSend(event) {
    return removeUserFromEvent(event);
  },
  beforeSendTransaction(event) {
    return removeUserFromEvent(event);
  },
  integrations: integrations => [
    ...integrations,
    new Sentry.ReactNativeTracing({ routingInstrumentation })
  ],
  enabled: !isDevEnv,
  sampleRate: 0.3
});

// Infer the `RootState` and `AppDispatch` types from the store itself export
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Main component of the application
 * @constructor
 */
const RootComponent = (): JSX.Element => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <IODSExperimentalContextProvider>
        <IOThemeContextProvider theme={"light"}>
          <ToastProvider>
            <Provider store={store}>
              <PersistGate loading={undefined} persistor={persistor}>
                <BottomSheetModalProvider>
                  <LightModalProvider>
                    <RootContainer />
                  </LightModalProvider>
                </BottomSheetModalProvider>
              </PersistGate>
            </Provider>
          </ToastProvider>
        </IOThemeContextProvider>
      </IODSExperimentalContextProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

/**
 * We wrap the main app component with the sentry utility function to handle
 * the Performance monitoring
 */
export const App = Sentry.wrap(RootComponent);
