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
import { JSX } from "react";
import RootContainer from "./RootContainer";
import { persistor, store } from "./boot/configureStoreAndPersistor";
import { LightModalProvider } from "./components/ui/LightModal";
import { StatusMessages } from "./components/StatusMessages/StatusMessages";
import { AppFeedbackProvider } from "./features/appReviews/components/AppFeedbackProvider";
import { TourProvider } from "./features/tour/components/TourProvider";
import { IOAlertVisibleContextProvider } from "./components/StatusMessages/IOAlertVisibleContext";

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
                  <TourProvider>
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
                  </TourProvider>
                </PersistGate>
              </Provider>
            </ToastProvider>
          </IOThemeContextProvider>
        </IONewTypefaceContextProvider>
      </IODSExperimentalContextProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
