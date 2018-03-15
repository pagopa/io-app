/**
 * Defines Flow types for the available actions and store related stuff.
 *
 * @flow
 */

import { type Store as ReduxStore } from 'redux'
import { type NavigationAction } from 'react-navigation'

import { type GlobalState } from '../reducers/types'
import { type ApiUserProfile, type IdentityProvider } from '../utils/api'
import { type ProfileActions } from '../store/actions/profile'

export type ApplicationState = 'background' | 'inactive' | 'active'

export type ApplicationStateAction = {
  type: 'APP_STATE_CHANGE_ACTION',
  payload: ApplicationState
}

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
  | { type: 'UPDATE_USER_PROFILE_REQUEST_ACTION' }
  | { type: 'UPDATE_USER_PROFILE_ERROR_ACTION', data: { error: string } }
  | ApplicationStateAction
  | NavigationAction
  | ProfileActions

export type GetState = () => GlobalState

export type PromiseAction = Promise<Action>

export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any

export type AnyAction = Action | ThunkAction | PromiseAction | Array<Action>

export type Store = ReduxStore<GlobalState, AnyAction>

export type Dispatch = (action: AnyAction) => any

// Props injected by react-redux connect() function
export type ReduxProps = {
  dispatch: Dispatch
}
