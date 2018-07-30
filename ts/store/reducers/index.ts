/**
 * Aggregates all defined reducers
 */

import { reducer as networkReducer } from "react-native-offline";
import { combineReducers, Reducer } from "redux";
import { FormStateMap, reducer as formReducer } from "redux-form";
import { PersistConfig, persistReducer, purgeStoredState } from "redux-persist";

import { LOGOUT_SUCCESS } from "../actions/constants";
import { Action } from "../actions/types";
import createSecureStorage from "../storages/keychain";
import appStateReducer from "./appState";
import authenticationReducer, { AuthenticationState } from "./authentication";
import backendInfoReducer from "./backendInfo";
import deepLinkReducer from "./deepLink";
import entitiesReducer from "./entities";
import errorReducer from "./error";
import loadingReducer from "./loading";
import navigationReducer from "./navigation";
import notificationsReducer from "./notifications";
import onboardingReducer from "./onboarding";
import pinloginReducer from "./pinlogin";
import preferencesReducer from "./preferences";
import profileReducer from "./profile";
import { GlobalState } from "./types";
import walletReducer from "./wallet";

// A custom configuration to store the authentication into the Keychain
export const authenticationPersistConfig: PersistConfig = {
  key: "authentication",
  storage: createSecureStorage(),
  blacklist: ["deepLink"]
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
const appReducer: Reducer<GlobalState, Action> = combineReducers<
  GlobalState,
  Action
>({
  appState: appStateReducer,
  network: networkReducer,
  nav: navigationReducer,
  deepLink: deepLinkReducer,

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
  preferences: preferencesReducer,

  // WALLET
  wallet: walletReducer,

  // BACKEND INFO
  backendInfo: backendInfoReducer
});

export function createRootReducer(
  persistConfigs: ReadonlyArray<PersistConfig>
) {
  return (state: GlobalState | undefined, action: Action): GlobalState => {
    if (action.type === LOGOUT_SUCCESS) {
      // Purge the stored redux-persist state
      persistConfigs.forEach(persistConfig => purgeStoredState(persistConfig));

      /**
       * We can't return undefined for nested persist reducer, we need to return
       * the basic redux persist content.
       */
      state = state
        ? ({
            authentication: { _persist: state.authentication._persist }
          } as GlobalState)
        : undefined;
    }

    return appReducer(state, action);
  };
}
