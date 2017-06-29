/**
 * Aggregates all defined reducers
 *
 * @flow
 */

'use strict'

import { combineReducers } from 'redux'

import navReducer from './nav'
import userReducer from './user'

module.exports = combineReducers({
  nav: navReducer,
  user: userReducer,
})
