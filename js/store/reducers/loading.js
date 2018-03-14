/**
 * A reducer that manages loading state for all the actions dispatched.
 * To work the actions need to use the conventional flux/redux naming:
 *
 * - ACTION_NAME_(REQUEST|SUCCESS|FAILURE)
 *
 * @flow
 */

import _ from 'lodash'

import { type GlobalState } from '../../reducers/types'
import { type Action } from '../../actions/types'

// TODO: Check if is possible to add a better typing for this (don't think so)
export type LoadingState = Object

export const INITIAL_STATE = {}

/**
 * Create a selector that return true only if all the actions passed as parameter are not in loading state.
 *
 * USAGE: `createLoadingSelector(['PROFILE_LOAD', 'PREFERENCES_LOAD'])`
 */
export const createLoadingSelector = (actions: $ReadOnlyArray<string>) => (
  state: GlobalState
): boolean => {
  // Returns true only when all actions are not loading
  return actions.some(action => _.get(state, `loading.${action}`))
}

// Listen for _REQUEST|_SUCCESS|_FAILURE actions and set/remove loading state.
const reducer = (state: LoadingState = INITIAL_STATE, action: Action) => {
  const { type } = action
  const matches = /(.*)_(REQUEST|SUCCESS|FAILURE)/.exec(type)

  // Not a *_REQUEST / *_SUCCESS /  *_FAILURE actions, so we ignore them
  if (!matches) return state

  const [, requestName, requestState] = matches
  return {
    ...state,
    // Store whether a request is happening at the moment or not
    [requestName]: requestState === 'REQUEST'
  }
}

export default reducer
