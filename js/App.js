// @flow

import * as React from 'react'
import { Provider } from 'react-redux'
import { StyleProvider } from 'native-base'
import { PersistGate } from 'redux-persist/integration/react'
import Mixpanel from 'react-native-mixpanel'

import theme from './theme'

import config from '../ts-js/config'
import configureErrorHandler from './boot/configureErrorHandler'
import configureStoreAndPersistor from './boot/configureStoreAndPersistor'
import RootContainer from './RootContainer'

// Inizialize Mixpanel and configure the global js error handler
Mixpanel.sharedInstanceWithToken(config.mixpanelToken)
configureErrorHandler()

const { store, persistor } = configureStoreAndPersistor()

/**
 * Main component of the application
 *
 * TODO: Add a loading screen @https://www.pivotaltracker.com/story/show/155583084
 */
const App = (): React.Node => {
  return (
    <StyleProvider style={theme()}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RootContainer />
        </PersistGate>
      </Provider>
    </StyleProvider>
  )
}

export default App
