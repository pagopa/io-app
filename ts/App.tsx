import { StyleProvider } from "native-base";
import * as React from "react";
import { MenuProvider } from "react-native-popup-menu";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import theme from "./theme";

import configureErrorHandler from "./boot/configureErrorHandler";
import configureStoreAndPersistor from "./boot/configureStoreAndPersistor";
import RootContainer from "./RootContainer";

// Configure the global js error handler
configureErrorHandler();

const { store, persistor } = configureStoreAndPersistor();

/**
 * Main component of the application
 *
 * TODO: Add a loading screen @https://www.pivotaltracker.com/story/show/155583084
 */
export const App: React.SFC<never> = () => (
  <StyleProvider style={theme()}>
    <Provider store={store}>
      <PersistGate loading={undefined} persistor={persistor}>
        <MenuProvider>
          <RootContainer store={store} />
        </MenuProvider>
      </PersistGate>
    </Provider>
  </StyleProvider>
);
