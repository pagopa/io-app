/**
 * @flow
 */

'use strict'

export type Action =
  | { type: 'LOGGED_IN', data: { token: string } }
  | { type: 'LOGGED_OUT' }
  | { type: 'REQUEST_USER_PROFILE' }
  | { type: 'RECEIVE_USER_PROFILE', profile: Object, receivedAt: number }

export type PromiseAction = Promise<Action>
export type Dispatch = (action: Action | ThunkAction | PromiseAction | Array<Action>) => any
export type GetState = () => Object
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any
