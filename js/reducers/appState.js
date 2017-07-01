const initialState = { appState: 'background' }

import { APPSTATE_CHANGE } from '../actions'

export default function appState(state = initialState, action) {
  if (action.type === APPSTATE_CHANGE) {
    return {
      ...state,
      appState: action.data,
    }
  }
  return state
}
