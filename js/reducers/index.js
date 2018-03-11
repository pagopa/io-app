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
import loadingReducer from '../store/reducers/loading'
import errorReducer from '../store/reducers/error'
import profileReducer from '../store/reducers/profile'

/**
 * Here we combine all the reducers.
 * We try to separate UI state from the DATA state.
 * UI state is mostly used to check what to show hide in the screens (ex. errors/spinners).
 * DATA state is where we store real data fetched from the API (ex. profile/messages).
 */
module.exports = combineReducers({
  appState: appStateReducer,
  network,
  navigation: navigationReducer,
  user: userReducer,

  // UI
  loading: loadingReducer,
  error: errorReducer,

  // DATA
  profile: profileReducer
})
