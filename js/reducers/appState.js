/**
 * Implements the AppState reducers.
 *
 * Handles React Native's AppState changes.
 *
 * @flow
 */

import { APPLICATION_STATE_CHANGE_ACTION } from '../actions'
import type { ApplicationStateAction, ApplicationState } from '../actions/types'

export type InitialAppState = {
  appState: ApplicationState
}

const initialAppState: InitialAppState = {
  appState: 'background'
}

export default function appState(
  state: InitialAppState = initialAppState,
  action: ApplicationStateAction
) {
  if (action.type === APPLICATION_STATE_CHANGE_ACTION) {
    return {
      ...state,
      appState: action.name
    }
  }
  return state
}
