/**
 * @flow
 */

'use strict'

var { combineReducers } = require('redux')

module.exports = combineReducers({
  // config: require('./config'),
  // notifications: require('./notifications'),
  user: require('./user'),
  // navigation: require('./navigation'),
})
