/**
 * Implements the AppState reducers.
 *
 * Handles React Native's AppState changes.
 *
 * @flow
 */

import { APP_STATE_CHANGE_ACTION } from '../enhancers/applyAppStateListener'
import {
  type ApplicationStateAction,
  type ApplicationState
} from '../actions/types'

export type AppState = {
  appState: ApplicationState
}

export const initialAppState: AppState = {
  appState: 'background'
}

export default function appState(
  state: AppState = initialAppState,
  action: ApplicationStateAction
) {
  if (action.type === APP_STATE_CHANGE_ACTION) {
    return {
      ...state,
      appState: action.payload
    }
  }
  return state
}
