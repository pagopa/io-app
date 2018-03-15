// @flow

import { type NavigationState } from 'react-navigation'

import { type AnyAction } from '../actions/types'
import { type AppState } from './appState'
import { type UserState } from './user'
import { type LoadingState } from '../store/reducers/loading'
import { type ErrorState } from '../store/reducers/error'
import { type ProfileState } from '../store/reducers/profile'

export type NetworkState = {
  isConnected: boolean,
  actionQueue: Array<AnyAction>
}

export type GlobalState = {
  appState: AppState,
  network: NetworkState,
  navigation: NavigationState,
  user: UserState,
  loading: LoadingState,
  error: ErrorState,
  profile: ProfileState
}
