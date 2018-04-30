/**
 * Action types and action creator related to the Messages.
 */

import { ApiMessages } from '../../api'
import {
  MESSAGES_LOAD_REQUEST,
  MESSAGES_LOAD_SUCCESS,
  MESSAGES_LOAD_FAILURE
} from './constants'

// Actions
export type MessagesLoadRequest = {
  type: typeof MESSAGES_LOAD_REQUEST
}

export type MessagesLoadSuccess = {
  type: typeof MESSAGES_LOAD_SUCCESS,
  payload: ApiMessages
}

export type MessagesLoadFailure = {
  type: typeof MESSAGES_LOAD_FAILURE,
  payload: string
}

export type MessagesActions =
  | MessagesLoadRequest
  | MessagesLoadSuccess
  | MessagesLoadFailure

// Creators
export const loadMessages = (): MessagesLoadRequest => ({
  type: MESSAGES_LOAD_REQUEST
})
