// @flow

import { type NavigationState } from 'react-navigation'

import { type AnyAction } from '../actions/types'
import { type AppState } from './appState'
import { type UserState } from './user'

export type NetworkState = {
  isConnected: boolean,
  actionQueue: Array<AnyAction>
}

export type GlobalState = {
  appState: AppState,
  network: NetworkState,
  navigation: NavigationState,
  user: UserState
}
