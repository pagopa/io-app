import { StyleProvider } from "native-base";
import * as React from "react";
import Mixpanel from "react-native-mixpanel";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import theme from "./theme";

import { MenuProvider } from "react-native-popup-menu";
import configureErrorHandler from "./boot/configureErrorHandler";
import configurePushNotifications from "./boot/configurePushNotification";
import configureStoreAndPersistor from "./boot/configureStoreAndPersistor";
import * as config from "./config";
import RootContainer from "./RootContainer";

// Inizialize Mixpanel and configure the global js error handler
Mixpanel.sharedInstanceWithToken(config.mixpanelToken);
configureErrorHandler()
  // tslint:disable-next-line:no-empty
  .then(() => {})
  // tslint:disable-next-line:no-empty
  .catch(() => {});

const { store, persistor } = configureStoreAndPersistor();

// Configure the application to receive push notifications
configurePushNotifications(store);

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
          <RootContainer />
        </MenuProvider>
      </PersistGate>
    </Provider>
  </StyleProvider>
);
