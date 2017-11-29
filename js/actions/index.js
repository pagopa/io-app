/**
 * Aggregates all the actions available to components.
 *
 * @flow
 */

'use strict'

import loginActions from './login'
import userActions from './user'
import appStateActions from './appState'

module.exports = {
  ...loginActions,
  ...userActions,
  ...appStateActions
}
