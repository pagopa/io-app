import { NavigationState } from 'react-navigation'

import { Action } from '../actions/types'
import { AppState } from './appState'
import { UserState } from './user'
import { LoadingState } from '../store/reducers/loading'
import { ErrorState } from '../store/reducers/error'
import { SessionState } from '../store/reducers/session'
import { OnboardingState } from '../store/reducers/onboarding'
import { ProfileState } from '../store/reducers/profile'

export type NetworkState = {
  isConnected: boolean,
  actionQueue: ReadonlyArray<Action>
}

export type GlobalState = {
  appState: AppState,
  network: NetworkState,
  navigation: NavigationState,
  user: UserState,
  loading: LoadingState,
  error: ErrorState,
  session: SessionState,
  onboarding: OnboardingState,
  profile: ProfileState
}
