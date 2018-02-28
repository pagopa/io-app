/**
 * A store enhancer that listen on application state changes and dispatch proper actions
 */

import { AppState } from 'react-native'

export const APP_STATE_CHANGE_ACTION = 'APP_STATE_CHANGE_ACTION'

export default () => createStore => (...args) => {
  const store = createStore(...args)

  let currentState = ''

  const handleAppStateChange = nextAppState => {
    if (currentState !== nextAppState) {
      store.dispatch({
        type: APP_STATE_CHANGE_ACTION,
        payload: nextAppState
      })

      currentState = nextAppState
    }
  }

  AppState.addEventListener('change', handleAppStateChange)
  handleAppStateChange(AppState.currentState)
  return store
}
