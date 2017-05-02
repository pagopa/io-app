/**
 * Aggregates all the actions available to components.
 *  
 * @flow
 */

'use strict'

import loginActions from './login'
import userActions from './user'

module.exports = {
  ...loginActions,
  ...userActions,
}
