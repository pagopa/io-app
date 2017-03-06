/**
 * @flow
 */

'use strict';

import {applyMiddleware, createStore} from 'redux';
const reducers = require('../reducers');
import {persistStore, autoRehydrate} from 'redux-persist';
const createLogger = require('redux-logger');
const {AsyncStorage} = require('react-native');

const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;

const logger = createLogger({
  predicate: (getState, action) => isDebuggingInChrome,
  collapsed: true,
  duration: true,
});

function configureStore(onComplete: ?() => void) {
  const store = autoRehydrate()(createStore)(reducers);
  persistStore(store, {storage: AsyncStorage}, onComplete);
  if (isDebuggingInChrome) {
    window.store = store;
  }
  return store;
}

module.exports = configureStore;
