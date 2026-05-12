import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  IODSExperimentalContextProvider,
  IONewTypefaceContextProvider,
  IOThemeContextProvider,
  ToastProvider
} from "@pagopa/io-app-design-system";
import * as TaskManager from "expo-task-manager";
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
import {
  ITW_STATUS_LIST_FETCH_TASK,
  itwStatusListFetchTaskHandler
} from "./features/itwallet/statusList/tasks";
import { TourProvider } from "./features/tour/components/TourProvider";

/**
 * BACKGROUND TASKS
 *
 * Background tasks must be defined in the global scope, outside of any React component, and before the app renders.
 * See more details in the Expo documentation: https://docs.expo.dev/versions/latest/sdk/background-task/
 *
 * In case of multiple task definitions, the last registered background task determines the minimum interval
 * for execution (https://docs.expo.dev/versions/latest/sdk/background-task/#multiple-background-tasks)
 *
 */
TaskManager.defineTask(
  ITW_STATUS_LIST_FETCH_TASK,
  itwStatusListFetchTaskHandler
);

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
    </KeyboardProvider>
  </GestureHandlerRootView>
);

export default App;
