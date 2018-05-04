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

export type ObjectListOfNormalizedMessages = {
  [id: string] : {
        id: string,
        date: string,
        content: { subject: string, markdown: string},
        sender_service_id: string
      }
  }
// A type to store single message of the user
export type ListMessages = {
  byId:  ObjectListOfNormalizedMessages,
  allIds: ReadonlyArray<string>
}
// A type to store all the messages of the user
export type NormalizedMessages = {
  messages?: ListMessages,
  page_size?: number,
  next?: string
}


export type MessagesState = NormalizedMessages | null

export const INITIAL_STATE = {}

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

export function getAllMessagesById(state: MessagesState ) : ObjectListOfNormalizedMessages | MessagesState {
  if (Object.keys(state).length !== 0 ) {
  return state.messages.byId
  }
  else return state
}

export default reducer
