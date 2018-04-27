/**
 * A reducer that manages the errors for all the actions dispatched.
 * To work the actions need to use the conventional flux/redux naming:
 *
 * - ACTION_NAME_(REQUEST|SUCCESS|FAILURE)
 */

import get from 'lodash/get'

import { GlobalState } from '../../reducers/types'
import { Action } from '../../actions/types'
import { FetchRequestActionsType, ERROR_CLEAR } from '../actions/constants'

export type ErrorState = { [key in FetchRequestActionsType]?: string }

export const INITIAL_STATE: ErrorState = {}

/**
 * Create a selector that return the first error found if any of the actions passed as parameter is in error.
 *
 * USAGE: `createErrorSelector(['PROFILE_LOAD', 'PREFERENCES_LOAD'])`
 */
export const createErrorSelector = (
  actions: ReadonlyArray<FetchRequestActionsType>
): ((_: GlobalState) => string) => (state: GlobalState): string => {
  // Returns first error message found if any
  return (
    actions
      .map((action: FetchRequestActionsType): string =>
        get(state, `error.${action}`)
      )
      // eslint-disable-next-line no-magic-numbers
      .filter((message: string): boolean => !!message)[0]
  )
}

// Listen for ERROR_CLEAR|*_REQUEST|*_FAILURE actions and set/remove error message.
const reducer = (
  state: ErrorState = INITIAL_STATE,
  action: Action
): ErrorState => {
  const { type } = action

  // Clear ERROR explicitly
  if (action.type === ERROR_CLEAR) {
    const newState = Object.assign({}, state)
    delete newState[action.payload]
    return newState
  }

  const matches = /(.*)_(REQUEST|FAILURE)/.exec(type)

  // Not a *_REQUEST /  *_FAILURE actions, so we ignore them
  if (!matches) {
    return state
  }

  const [, requestName, requestState] = matches
  if (requestState === 'FAILURE') {
    // We need to set the error message
    return {
      ...state,
      [requestName]: (action as any).payload || 'Generic error'
    }
  } else {
    // We need to remove the error message
    const { ...newState } = state
    delete newState[requestName]
    return newState
  }
}

export default reducer
