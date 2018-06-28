/**
 * Aggregates all defined reducers
 */

import { reducer as networkReducer } from "react-native-offline";
import { combineReducers, Reducer } from "redux";
import { FormStateMap, reducer as formReducer } from "redux-form";
import { PersistConfig, persistReducer } from "redux-persist";

import { Action } from "../actions/types";
import createSecureStorage from "../storages/keychain";
import appStateReducer from "./appState";
import authenticationReducer, { AuthenticationState } from "./authentication";
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
const reducer = combineReducers<GlobalState, Action>({
  appState: appStateReducer,
  network: networkReducer,
  navigation: navigationReducer,

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
  wallet: walletReducer
});

export default reducer;
