/**
 * Defines Flow types for the available actions and store related stuff.
 */

import {
  Store as ReduxStore,
  Dispatch as DispatchAPI,
  MiddlewareAPI as ReduxMiddlewareAPI,
  StoreEnhancer as ReduxStoreEnhancer
} from 'redux'
import { NavigationAction } from 'react-navigation'

import { GlobalState } from '../reducers/types'
import { ApiUserProfile, IdentityProvider } from '../utils/api'
import { SessionActions } from '../store/actions/session'
import { OnboardingActions } from '../store/actions/onboarding'
import { ProfileActions } from '../store/actions/profile'
import { APP_STATE_CHANGE_ACTION } from '../store/actions/constants'

export type ApplicationState = 'background' | 'inactive' | 'active'

export type ApplicationStateAction = {
  type: typeof APP_STATE_CHANGE_ACTION
  payload: ApplicationState
}

export type Action =
  | { type: 'USER_WILL_LOGIN_ACTION' }
  | {
      type: 'USER_SELECTED_SPID_PROVIDER_ACTION'
      data: { idp: IdentityProvider }
    }
  | { type: 'USER_LOGGED_IN_ACTION'; data: { token: string; idpId: string } }
  | { type: 'USER_LOGIN_ERROR_ACTION'; data: { error: string } }
  | { type: 'USER_LOGGED_OUT_ACTION' }
  | { type: 'REQUEST_USER_PROFILE_ACTION' }
  | {
      type: 'RECEIVE_USER_PROFILE_ACTION'
      profile: ApiUserProfile
      receivedAt: number
    }
  | { type: 'UPDATE_USER_PROFILE_REQUEST_ACTION' }
  | { type: 'UPDATE_USER_PROFILE_ERROR_ACTION'; data: { error: string } }
  | ApplicationStateAction
  | NavigationAction
  | SessionActions
  | OnboardingActions
  | ProfileActions

/* eslint-disable no-use-before-define */
// We need to disable the eslint rule because of a problem described here @https://github.com/babel/babel-eslint/issues/485
export type GetState = () => GlobalState

export type Thunk = (dispatch: Dispatch, getState: GetState) => void

export type AnyAction = Action | Thunk

export type Dispatch = DispatchAPI<AnyAction>

export type Store = ReduxStore<GlobalState>

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>

export type MiddlewareAPI = ReduxMiddlewareAPI<GlobalState>

// Props injected by react-redux connect() function
export type ReduxProps = {
  dispatch: Dispatch
}
