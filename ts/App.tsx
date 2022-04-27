import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StyleProvider } from "native-base";
import * as React from "react";
import { MenuProvider } from "react-native-popup-menu";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "react-native-gesture-handler";
import { persistor, store } from "./boot/configureStoreAndPersistor";
import { LightModalProvider } from "./components/ui/LightModal";
import RootContainer from "./RootContainer";
import theme from "./theme";

// Infer the `RootState` and `AppDispatch` types from the store itself export
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Main component of the application
 * @constructor
 */
export const App: React.FunctionComponent<never> = () => (
  <StyleProvider style={theme()}>
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
  </StyleProvider>
);
