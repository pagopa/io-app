// @flow

import React from 'react'
import { Provider } from 'react-redux'
import { StyleProvider } from 'native-base'
import { PersistGate } from 'redux-persist/integration/react'
import Mixpanel from 'react-native-mixpanel'

import getTheme from '../native-base-theme/components'
import material from '../native-base-theme/variables/material'

import config from './config'
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
const App = (): React$Element<*> => {
  return (
    <StyleProvider style={getTheme(material)}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RootContainer />
        </PersistGate>
      </Provider>
    </StyleProvider>
  )
}

export default App
