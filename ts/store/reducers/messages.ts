/**
 * A reducer for the Messages.
 * It only manages SUCCESS actions because all UI state properties (like loading/error)
 * are managed by different global reducers.
 *
 * @flow
 */

import {
  MESSAGES_LOAD_SUCCESS
} from '../actions/constants'

import { Action } from '../../actions/types'
import { ApiMessages } from '../../api'

export type MessagesState = ApiMessages | null

export const INITIAL_STATE = null

// To normalize
const reducer = (
  state: MessagesState = INITIAL_STATE,
  action: Action
): MessagesState => {
  switch (action.type) {
    case MESSAGES_LOAD_SUCCESS:
      return action.payload
    default:
      return state
  }
}

export default reducer
