import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StyleProvider } from "native-base";
import * as React from "react";
import { MenuProvider } from "react-native-popup-menu";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  IODSExperimentalContextProvider,
  IOThemeContextProvider
} from "@pagopa/io-app-design-system";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { persistor, store } from "./boot/configureStoreAndPersistor";
import { LightModalProvider } from "./components/ui/LightModal";
import RootContainer from "./RootContainer";
import theme from "./theme";
import { ToastProvider } from "./components/Toast";

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
