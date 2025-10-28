import { getType } from "typesafe-actions";
import { PersistConfig, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action } from "../../../../../store/actions/types";
import { closeSessionExpirationBanner } from "../actions";
import { loginSuccess } from "../../../common/store/actions";

export type LoginPreferencesState = {
  showSessionExpirationBanner: boolean;
};

const loginPreferencesInitialState: LoginPreferencesState = {
  showSessionExpirationBanner: true
};

const loginPreferencesReducer = (
  state: LoginPreferencesState = loginPreferencesInitialState,
  action: Action
): LoginPreferencesState => {
  switch (action.type) {
    case getType(loginSuccess):
      return loginPreferencesInitialState;
    case getType(closeSessionExpirationBanner):
      return {
        ...state,
        showSessionExpirationBanner: false
      };

    default:
      return state;
  }
};

const CURRENT_REDUX_OPT_IN_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "loginPreferences",
  storage: AsyncStorage,
  version: CURRENT_REDUX_OPT_IN_STORE_VERSION,
  whitelist: ["showSessionExpirationBanner"]
};

export const loginPreferencesPersistor = persistReducer<
  LoginPreferencesState,
  Action
>(persistConfig, loginPreferencesReducer);
