/**
 * A reducer that manages the errors for all the actions dispatched.
 * To work the actions need to use the conventional flux/redux naming:
 *
 * - ACTION_NAME_(REQUEST|SUCCESS|FAILURE)
 *
 * @flow
 */

import _ from 'lodash'

import { type GlobalState } from '../../reducers/types'
import { type Action } from '../../actions/types'
import { type FetchRequestActionsType } from '../actions/constants'

export type ErrorState = {
  [key: FetchRequestActionsType]: string
}

export const INITIAL_STATE: ErrorState = {}

/**
 * Create a selector that return the first error found if any of the actions passed as parameter is in error.
 *
 * USAGE: `createErrorSelector(['PROFILE_LOAD', 'PREFERENCES_LOAD'])`
 */
export const createErrorSelector = (
  actions: $ReadOnlyArray<FetchRequestActionsType>
) => (state: GlobalState): ?string => {
  // Returns first error message found if any
  return actions
    .map(action => _.get(state, `error.${action}`))
    .filter(message => !!message)[0]
}

// Listen for _REQUEST|_FAILURE actions and set/remove error message.
const reducer = (
  state: ErrorState = INITIAL_STATE,
  action: Action
): ErrorState => {
  const { type } = action
  const matches = /(.*)_(REQUEST|FAILURE)/.exec(type)

  // Not a *_REQUEST /  *_FAILURE actions, so we ignore them
  if (!matches) return state

  const [, requestName, requestState] = matches
  if (requestState === 'FAILURE') {
    // We need to set the error message
    return {
      ...state,
      [requestName]: action.payload ? action.payload : 'Generic error'
    }
  } else {
    // We need to remove the error message
    const { ...newState } = state
    delete newState[requestName]
    return newState
  }
}

export default reducer
