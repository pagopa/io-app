/**
 * Configures the Redux store
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

import { analytics } from '../middlewares'

const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent

const logger = createLogger({
  predicate: () => isDebuggingInChrome,
  collapsed: true,
  duration: true
})

export default function configureStore(onComplete: ?() => void) {
  const store = createStore(
    reducers,
    undefined,
    compose(
      applyMiddleware(
        thunk,
        logger,
        analytics.actionTracking,
        analytics.screenTracking
      ),
      autoRehydrate()
    )
  )

  persistStore(store, { storage: AsyncStorage }, onComplete)

  if (isDebuggingInChrome) {
    window.store = store
  }

  return store
}
