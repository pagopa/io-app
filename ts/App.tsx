import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  IODSExperimentalContextProvider,
  IOThemeContextProvider,
  ToastProvider
} from "@pagopa/io-app-design-system";
import { StyleProvider } from "native-base";
import * as React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import * as Sentry from "@sentry/react-native";
import { ErrorEvent, TransactionEvent } from "@sentry/types";
import RootContainer from "./RootContainer";
import { persistor, store } from "./boot/configureStoreAndPersistor";
import { LightModalProvider } from "./components/ui/LightModal";
import theme from "./theme";
import { sentryDsn } from "./config";
import { isLocalEnv } from "./utils/environment";

const removeUserFromEvent = (event: ErrorEvent | TransactionEvent) => {
  // console.log(JSON.stringify(event));
  // Modify or drop the event here
  if (event.user) {
    // Don't send user's email address
    return { ...event, user: undefined };
    // delete event.user;
  }
  return event;
};

Sentry.init({
  dsn: sentryDsn,
  beforeSend(event) {
    return removeUserFromEvent(event);
  },
  // eslint-disable-next-line sonarjs/no-identical-functions
  beforeSendTransaction(event) {
    return removeUserFromEvent(event);
  },
  enabled: !isLocalEnv,
  sampleRate: 0.3
});

Sentry.setUser(null);

// Infer the `RootState` and `AppDispatch` types from the store itself export
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Main component of the application
 * @constructor
 */
export const App: React.FunctionComponent<never> = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <StyleProvider style={theme()}>
      <SafeAreaProvider>
        <IODSExperimentalContextProvider>
          <IOThemeContextProvider theme={"light"}>
            <ToastProvider>
              <Provider store={store}>
                <PersistGate loading={undefined} persistor={persistor}>
                  <BottomSheetModalProvider>
                    <LightModalProvider>
                      <MenuProvider>
                        <RootContainer />
                      </MenuProvider>
                    </LightModalProvider>
                  </BottomSheetModalProvider>
                </PersistGate>
              </Provider>
            </ToastProvider>
          </IOThemeContextProvider>
        </IODSExperimentalContextProvider>
      </SafeAreaProvider>
    </StyleProvider>
  </GestureHandlerRootView>
);
