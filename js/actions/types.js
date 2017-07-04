/**
 * Defines Flow types for the available actions.
 *
 * @flow
 */

'use strict'

import type { ApiUserProfile, IdentityProvider } from '../utils/api'

export type Action =
  | { type: 'LOG_IN_INTENT' }
  | { type: 'SPID_PROVIDER', data: { idp: IdentityProvider } }
  | { type: 'LOGGED_IN', data: { token: string, idpId: string } }
  | { type: 'LOG_IN_ERROR', data: { error: string } }
  | { type: 'LOGGED_OUT' }
  | { type: 'REQUEST_USER_PROFILE' }
  | { type: 'RECEIVE_USER_PROFILE', profile: ApiUserProfile, receivedAt: number }

export type ApplicationState = 'background' | 'inactive' | 'active'

export type ApplicationStateAction =
  { type: 'APPLICATION_STATE_CHANGE_ACTION', name: ApplicationState }

export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any

export type PromiseAction = Promise<Action>

export type AnyAction = Action | ThunkAction | PromiseAction | Array<Action>

export type Dispatch = (action: AnyAction) => any

export type GetState = () => Object
