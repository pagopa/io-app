/**
 * @flow
 */

'use strict'

import { combineReducers } from 'redux'

import userReducer from './user'

module.exports = combineReducers({
  user: userReducer,
})
