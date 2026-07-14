import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { BottomSheetProvider } from "@swmansion/react-native-bottom-sheet";
import {
  IODSExperimentalContextProvider,
  IONewTypefaceContextProvider,
  IOThemeContextProvider,
  ToastProvider
} from "@io-app/design-system";
import { JSX } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import RootContainer from "./RootContainer";
import { persistor, store } from "./boot/configureStoreAndPersistor";
import { IOAlertVisibleContextProvider } from "./components/StatusMessages/IOAlertVisibleContext";
import { StatusMessages } from "./components/StatusMessages/StatusMessages";
import { LightModalProvider } from "./components/ui/LightModal";
import { AppFeedbackProvider } from "./features/appReviews/components/AppFeedbackProvider";
import { TourProvider } from "./features/tour/components/TourProvider";

// Infer the `RootState` and `AppDispatch` types from the store itself export
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Main component of the application
 * @constructor
 */
const App = (): JSX.Element => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <KeyboardProvider>
      <SafeAreaProvider>
        <IODSExperimentalContextProvider>
          <IONewTypefaceContextProvider>
            <IOThemeContextProvider theme={"light"}>
              <ToastProvider>
                <Provider store={store}>
                  <PersistGate loading={undefined} persistor={persistor}>
                    <TourProvider>
                      <IOAlertVisibleContextProvider>
                        <BottomSheetModalProvider>
                          <LightModalProvider>
                            <AppFeedbackProvider>
                              <StatusMessages>
                                {/*
                                  Software Mansion bottom-sheet portal host.
                                  Mounted above the navigators so modal sheets
                                  overlay the navigation header.
                                */}
                                <BottomSheetProvider>
                                  <RootContainer store={store} />
                                </BottomSheetProvider>
                              </StatusMessages>
                            </AppFeedbackProvider>
                          </LightModalProvider>
                        </BottomSheetModalProvider>
                      </IOAlertVisibleContextProvider>
                    </TourProvider>
                  </PersistGate>
                </Provider>
              </ToastProvider>
            </IOThemeContextProvider>
          </IONewTypefaceContextProvider>
        </IODSExperimentalContextProvider>
      </SafeAreaProvider>
    </KeyboardProvider>
  </GestureHandlerRootView>
);

export default App;
