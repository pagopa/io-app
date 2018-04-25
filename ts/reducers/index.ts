/**
 * Aggregates all defined reducers
 */

import { combineReducers, AnyAction } from 'redux'
import { reducer as network } from 'react-native-offline'
import { reducer as formReducer } from 'redux-form'

import appStateReducer from './appState'
import navigationReducer from './navigation'
import loadingReducer from '../store/reducers/loading'
import errorReducer from '../store/reducers/error'
import sessionReducer from '../store/reducers/session'
import onboardingReducer from '../store/reducers/onboarding'
import profileReducer from '../store/reducers/profile'
import { GlobalState } from './types'

export { AnyAction }
/**
 * Here we combine all the reducers.
 * We use the best practice of separating UI state from the DATA state.
 * UI state is mostly used to check what to show hide in the screens (ex. errors/spinners).
 * DATA state is where we store real data fetched from the API (ex. profile/messages).
 * More at @https://medium.com/statuscode/dissecting-twitters-redux-store-d7280b62c6b1
 */
export default combineReducers<GlobalState>({
  appState: appStateReducer,
  network,
  navigation: navigationReducer,

  // UI
  loading: loadingReducer,
  error: errorReducer,

  // FORM
  // form: formReducer,

  // DATA
  session: sessionReducer,
  onboarding: onboardingReducer,
  profile: profileReducer
})
