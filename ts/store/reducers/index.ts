/**
 * Aggregates all defined reducers
 */

import pick from "lodash/pick";
import { reducer as networkReducer } from "react-native-offline";
import { combineReducers, Reducer } from "redux";
import { FormStateMap, reducer as formReducer } from "redux-form";
import { PersistConfig, persistReducer } from "redux-persist";

import { LOGOUT_SUCCESS } from "../actions/constants";
import { Action } from "../actions/types";
import createSecureStorage from "../storages/keychain";
import appStateReducer from "./appState";
import authenticationReducer, { AuthenticationState } from "./authentication";
import backendInfoReducer from "./backendInfo";
import entitiesReducer from "./entities";
import errorReducer from "./error";
import loadingReducer from "./loading";
import navigationReducer from "./navigation";
import notificationsReducer from "./notifications";
import onboardingReducer from "./onboarding";
import pinloginReducer from "./pinlogin";
import profileReducer from "./profile";
import { GlobalState } from "./types";
import walletReducer from "./wallet";

/** State keys we want to retail on user logout.
 *  We can't use ReadonlyArray because lodash/pick doesn't like it.
 */
// tslint:disable-next-line:readonly-array
const stateRetainKeys = [
  "appState",
  "network",
  "nav",
  "loading",
  "error",
  "authentication"
];

// A custom configuration to store the authentication into the Keychain
const authenticationPersistConfig: PersistConfig = {
  key: "authentication",
  storage: createSecureStorage()
};

/**
 * Here we combine all the reducers.
 * We use the best practice of separating UI state from the DATA state.
 * UI state is mostly used to check what to show hide in the screens (ex.
 * errors/spinners).
 * DATA state is where we store real data fetched from the API (ex.
 * profile/messages).
 * More at
 * @https://medium.com/statuscode/dissecting-twitters-redux-store-d7280b62c6b1
 */
const appReducer = combineReducers<GlobalState, Action>({
  appState: appStateReducer,
  network: networkReducer,
  nav: navigationReducer,

  // UI
  loading: loadingReducer,
  error: errorReducer,

  // FORM
  form: formReducer as Reducer<FormStateMap, Action>,

  // DATA
  authentication: persistReducer<AuthenticationState, Action>(
    authenticationPersistConfig,
    authenticationReducer
  ),
  onboarding: onboardingReducer,
  notifications: notificationsReducer,
  profile: profileReducer,
  entities: entitiesReducer,
  pinlogin: pinloginReducer,

  // WALLET
  wallet: walletReducer,

  // BACKEND INFO
  backendInfo: backendInfoReducer
});

const rootReducer = (state: GlobalState, action: Action) => {
  return appReducer(filterStateOnLogout(state, action), action);
};

// On logout we need to clear the state from user specific data
function filterStateOnLogout(state: GlobalState, action: Action): GlobalState {
  // If the action is LOGOUT_SUCCESS filter the not needed keys
  return action.type === LOGOUT_SUCCESS
    ? (pick(state, stateRetainKeys) as GlobalState)
    : state;
}

export default rootReducer;
