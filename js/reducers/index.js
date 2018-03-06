/**
 * Aggregates all defined reducers
 *
 * @flow
 */

'use strict'

import { combineReducers } from 'redux'
import { reducer as network } from 'react-native-offline'

import appStateReducer from './appState'
import navigationReducer from './navigation'
import userReducer from './user'

module.exports = combineReducers({
  appState: appStateReducer,
  network,
  navigation: navigationReducer,
  user: userReducer
})
