/**
 * Configura lo store dello stato dell'applicazione
 *
 * @flow
 */

'use strict'

import { AsyncStorage } from 'react-native'
import { compose, applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import { persistStore, autoRehydrate } from 'redux-persist'
import { createLogger } from 'redux-logger'

import reducers from '../reducers'

const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent

const logger = createLogger({
  predicate: (getState, action) => isDebuggingInChrome,
  collapsed: true,
  duration: true,
})

function configureStore(onComplete: ?() => void) {

  const store = createStore(
    reducers,
    undefined,
    compose(
      applyMiddleware(thunk, logger),
      autoRehydrate()
    )
  )

  persistStore(store, { storage: AsyncStorage }, onComplete)

  if (isDebuggingInChrome) {
    window.store = store
  }

  return store
}

module.exports = configureStore
