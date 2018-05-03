/**
 * Aggregates all defined reducers
 */

import { reducer as networkReducer } from "react-native-offline";
import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";

import { Action } from "../actions/types";
import errorReducer from "../store/reducers/error";
import loadingReducer from "../store/reducers/loading";
import onboardingReducer from "../store/reducers/onboarding";
import profileReducer from "../store/reducers/profile";
import sessionReducer from "../store/reducers/session";
import appStateReducer from "./appState";
import navigationReducer from "./navigation";
import { GlobalState } from "./types";

/**
 * Here we combine all the reducers.
 * We use the best practice of separating UI state from the DATA state.
 * UI state is mostly used to check what to show hide in the screens (ex. errors/spinners).
 * DATA state is where we store real data fetched from the API (ex. profile/messages).
 * More at @https://medium.com/statuscode/dissecting-twitters-redux-store-d7280b62c6b1
 */
export default combineReducers<GlobalState, Action>({
  appState: appStateReducer,
  network: networkReducer,
  navigation: navigationReducer,

  // UI
  loading: loadingReducer,
  error: errorReducer,

  // FORM
  form: formReducer,

  // DATA
  session: sessionReducer,
  onboarding: onboardingReducer,
  profile: profileReducer
});
