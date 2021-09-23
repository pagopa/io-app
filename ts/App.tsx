import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StyleProvider } from "native-base";
import * as React from "react";
import { MenuProvider } from "react-native-popup-menu";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "./boot/configureStoreAndPersistor";
import { LightModalProvider } from "./components/ui/LightModal";
import RootContainer from "./RootContainer";
import theme from "./theme";

// Infer the `RootState` and `AppDispatch` types from the store itselfexport
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Main component of the application
 *
 * TODO: Add a loading screen @https://www.pivotaltracker.com/story/show/155583084
 */
export const App: React.SFC<never> = () => (
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
