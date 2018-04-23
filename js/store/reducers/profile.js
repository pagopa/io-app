/**
 * A reducer for the Profile.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 *
 * @flow
 */

import * as pot from '../../utils/pot'
import {
  PROFILE_LOAD_REQUEST,
  PROFILE_LOAD_SUCCESS,
  PROFILE_UPDATE_SUCCESS,
  PROFILE_LOAD_FAILURE,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_FAILURE
} from '../actions/constants'
import { type Action } from '../../actions/types'
import { type ApiProfile } from '../../api'

export type ProfileState = pot.Pot<string, ApiProfile>

export const INITIAL_STATE: ProfileState = pot.empty()

const reducer = (
  state: ProfileState = INITIAL_STATE,
  action: Action
): ProfileState => {
  switch (action.type) {
    case PROFILE_LOAD_REQUEST || PROFILE_UPDATE_REQUEST:
      if (state instanceof pot.Empty || state instanceof pot.Ready) {
        return state.pending(new Date())
      }
      // TODO log warning
      return state

    case PROFILE_LOAD_SUCCESS || PROFILE_UPDATE_SUCCESS:
      if (state instanceof pot.Pending || state instanceof pot.PendingStale) {
        return state.ready(action.payload)
      }
      // TODO log warning
      return state

    case PROFILE_LOAD_FAILURE || PROFILE_UPDATE_FAILURE:
      if (state instanceof pot.Pending || state instanceof pot.PendingStale) {
        state.fail(action.payload)
      }
      // TODO log warning
      return state

    default:
      return state
  }
}

export default reducer
