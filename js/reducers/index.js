/**
 * Aggregates all defined reducers
 *
 * @flow
 */

'use strict'

import { combineReducers } from 'redux'

import navReducer from './nav'
import userReducer from './user'
import appStateReducer from './appState'

module.exports = combineReducers({
  nav: navReducer,
  user: userReducer,
  appState: appStateReducer,
})
