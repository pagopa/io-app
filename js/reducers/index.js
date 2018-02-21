/**
 * Aggregates all defined reducers
 *
 * @flow
 */

'use strict'

import { combineReducers } from 'redux'
import { reducer as network } from 'react-native-offline'

import navReducer from './nav'
import userReducer from './user'
import appStateReducer from './appState'

module.exports = combineReducers({
  appState: appStateReducer,
  network,
  nav: navReducer,
  user: userReducer
})
