/**
 * @flow
 */

'use strict';

import {applyMiddleware, createStore} from 'redux';
var reducers = require('../reducers');
import {persistStore, autoRehydrate} from 'redux-persist';
var createLogger = require('redux-logger');
var {AsyncStorage} = require('react-native');

var isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;

var logger = createLogger({
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
