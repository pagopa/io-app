/**
 * Defines actions related to React Native's `AppState` changes.
 *
 * @flow
 */

import type { ApplicationState, ApplicationStateAction } from './types'

const APPLICATION_STATE_CHANGE_ACTION = 'APPLICATION_STATE_CHANGE_ACTION'

function appStateChange(appState: ApplicationState): ApplicationStateAction {
  return {
    type: APPLICATION_STATE_CHANGE_ACTION,
    name: appState
  }
}

module.exports = {
  APPLICATION_STATE_CHANGE_ACTION,
  appStateChange
}
