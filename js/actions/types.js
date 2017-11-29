/**
 * Defines Flow types for the available actions.
 *
 * @flow
 */

'use strict'

import type { ApiUserProfile, IdentityProvider } from '../utils/api'

export type Action =
  | { type: 'USER_WILL_LOGIN_ACTION' }
  | {
      type: 'USER_SELECTED_SPID_PROVIDER_ACTION',
      data: { idp: IdentityProvider }
    }
  | { type: 'USER_LOGGED_IN_ACTION', data: { token: string, idpId: string } }
  | { type: 'USER_LOGIN_ERROR_ACTION', data: { error: string } }
  | { type: 'USER_LOGGED_OUT_ACTION' }
  | { type: 'REQUEST_USER_PROFILE_ACTION' }
  | {
      type: 'RECEIVE_USER_PROFILE_ACTION',
      profile: ApiUserProfile,
      receivedAt: number
    }

export type ApplicationState = 'background' | 'inactive' | 'active'

export type ApplicationStateAction = {
  type: 'APPLICATION_STATE_CHANGE_ACTION',
  name: ApplicationState
}

export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any

export type PromiseAction = Promise<Action>

export type AnyAction = Action | ThunkAction | PromiseAction | Array<Action>

export type Dispatch = (action: AnyAction) => any

export type GetState = () => Object
