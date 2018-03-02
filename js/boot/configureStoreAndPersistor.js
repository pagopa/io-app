// @flow

import { applyMiddleware, compose, createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import { createLogger } from 'redux-logger'
import { analytics } from '../middlewares'
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers'
import storage from 'redux-persist/lib/storage'
import thunk from 'redux-thunk'

import applyAppStateListener from '../enhancers/applyAppStateListener'
import rootReducer from '../reducers'

const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['navigation']
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const logger = createLogger({
  predicate: () => isDebuggingInChrome,
  collapsed: true,
  duration: true
})

const navigation = createReactNavigationReduxMiddleware(
  'root',
  state => state.navigation
)

const configureStoreAndPersistor = () => {
  const enhancer = compose(
    applyAppStateListener(),
    applyMiddleware(
      thunk,
      logger,
      navigation,
      analytics.actionTracking,
      analytics.screenTracking
    )
  )

  const store = createStore(persistedReducer, {}, enhancer)
  const persistor = persistStore(store)

  if (isDebuggingInChrome) {
    window.store = store
  }

  return { store, persistor }
}

export default configureStoreAndPersistor
