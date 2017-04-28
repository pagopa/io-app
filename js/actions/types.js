/**
 * @flow
 */

'use strict'

import type { ApiUserProfile } from '../utils/api'

export type Action =
  | { type: 'LOGGED_IN', data: { token: string, idpId: string } }
  | { type: 'LOGGED_OUT' }
  | { type: 'REQUEST_USER_PROFILE' }
  | { type: 'RECEIVE_USER_PROFILE', profile: ApiUserProfile, receivedAt: number }

export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any

export type PromiseAction = Promise<Action>

export type Dispatch = (action: Action | ThunkAction | PromiseAction | Array<Action>) => any

export type GetState = () => Object
