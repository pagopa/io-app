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
import { ApplicationActions } from '../store/actions/application'
import { SessionActions } from '../store/actions/session'
import { OnboardingActions } from '../store/actions/onboarding'
import { ProfileActions } from '../store/actions/profile'
import { MessagesActions } from '../store/actions/messages'
import { APP_STATE_CHANGE_ACTION } from '../store/actions/constants'

export type ApplicationState = 'background' | 'inactive' | 'active'

export type ApplicationStateAction = {
  type: typeof APP_STATE_CHANGE_ACTION
  payload: ApplicationState
}

export type Action =
  | ApplicationActions
  | ApplicationStateAction
  | NavigationAction
  | SessionActions
  | OnboardingActions
  | ProfileActions
  | MessagesActions

/* eslint-disable no-use-before-define */
// We need to disable the eslint rule because of a problem described here @https://github.com/babel/babel-eslint/issues/485
export type GetState = () => GlobalState

export type Dispatch = DispatchAPI<Action, GlobalState>

export type Store = ReduxStore<GlobalState>

export type StoreEnhancer = ReduxStoreEnhancer<GlobalState>

export type MiddlewareAPI = ReduxMiddlewareAPI<Dispatch, GlobalState>

// Props injected by react-redux connect() function
export type ReduxProps = {
  dispatch: Dispatch
}
