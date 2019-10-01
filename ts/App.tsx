import { StyleProvider } from "native-base";
import * as React from "react";
import { MenuProvider } from "react-native-popup-menu";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import configureStoreAndPersistor from "./boot/configureStoreAndPersistor";
import { LightModalProvider } from "./components/ui/LightModal";
import RootContainer from "./RootContainer";
import theme from "./theme";

export const { store, persistor } = configureStoreAndPersistor();

/**
 * Main component of the application
 *
 * TODO: Add a loading screen @https://www.pivotaltracker.com/story/show/155583084
 */
export const App: React.SFC<never> = () => (
  <StyleProvider style={theme()}>
    <Provider store={store}>
      <PersistGate loading={undefined} persistor={persistor}>
        <LightModalProvider>
          <MenuProvider>
            <RootContainer />
          </MenuProvider>
        </LightModalProvider>
      </PersistGate>
    </Provider>
  </StyleProvider>
);
